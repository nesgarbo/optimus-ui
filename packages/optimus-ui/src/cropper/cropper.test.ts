import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Cropper } from './cropper';

/** A 200 x 100 picture: red on the left half, blue on the right. */
const picture = (() => {
    const canvas = document.createElement('canvas');

    canvas.width = 200;
    canvas.height = 100;

    const context = canvas.getContext('2d')!;

    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 100, 100);
    context.fillStyle = '#0000ff';
    context.fillRect(100, 0, 100, 100);

    return canvas.toDataURL('image/png');
})();

@Component({
    standalone: true,
    imports: [Cropper],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-cropper
        [src]="src()"
        [aspectRatio]="ratio()"
        [value]="value"
        (valueChange)="value = $event; valueWrites = valueWrites + 1"
        [readonly]="locked()"
        (changed)="events.push($event.type)"
        (ready)="readyCount = readyCount + 1"
        style="width: 400px; display: block"
    />`
})
class Host {
    readonly cropper = viewChild.required(Cropper);
    readonly src = signal(picture);
    readonly ratio = signal<number | undefined>(undefined);
    readonly locked = signal(false);
    value: string | null = null;
    events: string[] = [];
    readyCount = 0;
    valueWrites = 0;
}

const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));

const pixels = (url: string) =>
    new Promise<{ w: number; h: number; data: Uint8ClampedArray }>((resolve) => {
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement('canvas');

            canvas.width = image.width;
            canvas.height = image.height;

            const context = canvas.getContext('2d')!;

            context.drawImage(image, 0, 0);
            resolve({ w: image.width, h: image.height, data: context.getImageData(0, 0, image.width, image.height).data });
        };
        image.src = url;
    });

describe('Cropper', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const cropper = () => host.cropper();

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        await wait(600);
        await fixture.whenStable();
    });

    it('shows the image with a crop box and says when it is ready', () => {
        expect(host.readyCount).toBe(1);
        expect(fixture.nativeElement.querySelector('cropper-canvas')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('cropper-selection')).not.toBeNull();
        expect(cropper().loaded()).toBe(true);
        expect(cropper().selection()).not.toBeNull();
    });

    it('crops to a data URL that is smaller than the image', async () => {
        const url = await cropper().toDataURL();

        expect(url).toMatch(/^data:image\/png/);

        const { w, h } = await pixels(url!);

        expect(w).toBeLessThan(200);
        expect(h).toBeLessThan(100);
        expect(w).toBeGreaterThan(0);
    });

    it('crops what is under the box: select all, and both halves are there', async () => {
        cropper().selectAll();
        await wait();

        const { w, h, data } = await pixels((await cropper().toDataURL())!);
        const at = (x: number, y: number) => [...data.slice((y * w + x) * 4, (y * w + x) * 4 + 3)];

        expect(w / h).toBeCloseTo(2, 0);
        expect(at(Math.floor(w * 0.1), Math.floor(h / 2))[0]).toBeGreaterThan(200);
        expect(at(Math.floor(w * 0.9), Math.floor(h / 2))[2]).toBeGreaterThan(200);
    });

    it('sizes the output as asked', async () => {
        cropper().selectAll();
        await wait();

        const { w, h } = await pixels((await cropper().toDataURL({ width: 60, height: 30 }))!);

        expect([w, h]).toEqual([60, 30]);
    });

    it('exports a blob in the format asked', async () => {
        const blob = await cropper().toBlob({ type: 'image/jpeg' });

        expect(blob?.type).toBe('image/jpeg');
    });

    it('turns the image, and the crop follows', async () => {
        cropper().selectAll();
        await wait();
        cropper().rotate(90);
        await wait();
        cropper().selectAll();
        await wait();

        const { w, h, data } = await pixels((await cropper().toDataURL())!);

        expect(h / w).toBeCloseTo(2, 0);
        // Turned a quarter clockwise: red, which was on the left, is on top.
        expect(data[(Math.floor(h * 0.1) * w + Math.floor(w / 2)) * 4]).toBeGreaterThan(200);
        expect(host.events).toContain('rotate');
    });

    it('mirrors the image', async () => {
        cropper().selectAll();
        await wait();
        cropper().flipHorizontal();
        await wait();
        cropper().selectAll();
        await wait();

        const { w, h, data } = await pixels((await cropper().toDataURL())!);

        expect(data[(Math.floor(h / 2) * w + Math.floor(w * 0.1)) * 4 + 2]).toBeGreaterThan(200);
    });

    it('keeps the value in step with the crop box', async () => {
        cropper().selectAll();
        await wait(300);

        expect(host.value).toMatch(/^data:image\/png/);
        expect(host.events).toContain('select-all');

        cropper().clear();
        await wait(300);

        expect(host.value).toBeNull();
        expect(cropper().selection()).toBeNull();
    });

    it('holds the crop box to a shape', async () => {
        host.ratio.set(1);
        await fixture.whenStable();
        await wait(300);

        const box = cropper().selection()!;

        expect(box.width / box.height).toBeCloseTo(1, 1);

        const { w, h } = await pixels((await cropper().toDataURL())!);

        expect(w / h).toBeCloseTo(1, 1);
    });

    it('shows another image when the source changes', async () => {
        host.src.set(picture.replace('image/png', 'image/png'));
        await fixture.whenStable();
        await wait(600);

        expect(host.readyCount).toBe(1);

        const other = document.createElement('canvas');

        other.width = 50;
        other.height = 50;
        host.src.set(other.toDataURL());
        await fixture.whenStable();
        await wait(600);

        expect(host.readyCount).toBe(2);
    });

    it('locks the crop box when it is readonly', async () => {
        host.locked.set(true);
        await fixture.whenStable();
        await wait(300);

        const selection = fixture.nativeElement.querySelector('cropper-selection');

        expect(selection.movable).toBe(false);
        expect(selection.resizable).toBe(false);
    });

    it('says when an image cannot be loaded and leaves no crop', async () => {
        let failed = 0;
        const sub = cropper().failed.subscribe(() => failed++);

        host.src.set('data:image/png;base64,AAAA');
        await fixture.whenStable();
        await wait(500);
        sub.unsubscribe();

        expect(failed).toBe(1);
        expect(await cropper().toDataURL()).toBeNull();
    });

    it('does not mark a control as changed when it starts with no image', async () => {
        const other = TestBed.createComponent(Host);

        other.componentInstance.src.set('');
        document.body.appendChild(other.nativeElement);
        await other.whenStable();
        await wait(300);

        // A `null` that nobody asked for would have reached `[(value)]` and the form as a change.
        expect(other.componentInstance.valueWrites).toBe(0);
        other.destroy();
    });

    it('keeps the stage out of the image role, because it holds the controls', () => {
        expect(fixture.nativeElement.querySelector('[role="img"]')).toBeNull();
        expect(fixture.nativeElement.querySelector('[role="group"]')).not.toBeNull();
    });

    it('makes one value for a run of gestures', async () => {
        host.events.length = 0;

        cropper().zoom(0.1);
        cropper().zoom(0.1);
        cropper().zoom(0.1);
        await wait(400);

        expect(host.events.filter((e) => e === 'zoom')).toHaveLength(1);
    });

    it('does not build the cropper when it is destroyed while the image loads', async () => {
        const other = TestBed.createComponent(Host);
        const element = other.nativeElement as HTMLElement;

        document.body.appendChild(element);
        await other.whenStable();
        other.destroy();
        await wait(600);

        expect(element.querySelector('cropper-canvas')).toBeNull();
        expect(other.componentInstance.readyCount).toBe(0);
    });

    it('names the crop area in English by default and from `messages` when given', async () => {
        const bare = TestBed.createComponent(Cropper);

        await bare.whenStable();
        expect(bare.nativeElement.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Image to crop');

        bare.componentRef.setInput('messages', { imageToCrop: 'Imagen a recortar' });
        await bare.whenStable();
        expect(bare.nativeElement.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Imagen a recortar');

        bare.componentRef.setInput('alt', 'Foto');
        await bare.whenStable();
        expect(bare.nativeElement.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Foto');
    });
});
