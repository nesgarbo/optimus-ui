import { describe, expect, it } from 'vitest';
import type { PdfAnnotation, PdfShapeAnnotation } from '@openng/optimus-ui/types/pdfeditor';
import { afterDeletePage, afterInsertPage, afterMovePage, boundsOf, hitAnnotation, moveAnnotation, normalizeRotation, parseColor, pickAnnotation, resizeAnnotation, shownSize, shownToUser, transformPoint, userBoxToShown } from './pdf-model';

const rect = (page: number, x = 10, y = 10, width = 50, height = 30, extra: Partial<PdfShapeAnnotation> = {}): PdfAnnotation => ({
    id: `r${page}`,
    page,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    color: '#000',
    strokeWidth: 2,
    fillColor: '',
    fillOpacity: 1,
    ...extra
});

describe('rotation', () => {
    it('keeps a turn to a quarter', () => {
        expect([normalizeRotation(0), normalizeRotation(90), normalizeRotation(-90), normalizeRotation(450), normalizeRotation(540)]).toEqual([0, 90, 270, 90, 180]);
    });

    it('swaps the size of a page that is turned a quarter', () => {
        expect(shownSize(600, 800, 0)).toEqual({ width: 600, height: 800 });
        expect(shownSize(600, 800, 90)).toEqual({ width: 800, height: 600 });
        expect(shownSize(600, 800, 180)).toEqual({ width: 600, height: 800 });
        expect(shownSize(600, 800, 270)).toEqual({ width: 800, height: 600 });
    });
});

describe('shown space to user space', () => {
    const W = 600;
    const H = 800;

    it('puts the bottom left of the shown page on the right corner of the file, for each turn', () => {
        // Turned 90 clockwise, the bottom left of the file is at the top left of what is shown, so the bottom left of
        // what is shown is the file's top left.
        expect(transformPoint(shownToUser(W, H, 0), 0, 0)).toEqual([0, 0]);
        expect(transformPoint(shownToUser(W, H, 90), 0, 0)).toEqual([W, 0]);
        expect(transformPoint(shownToUser(W, H, 180), 0, 0)).toEqual([W, H]);
        expect(transformPoint(shownToUser(W, H, 270), 0, 0)).toEqual([0, H]);
    });

    it('is undone by the way back, for each turn and with an offset origin', () => {
        for (const rotation of [0, 90, 180, 270] as const) {
            const shown = shownSize(W, H, rotation);
            const m = shownToUser(W, H, rotation, 5, 7);
            const [ux, uy] = transformPoint(m, 100, shown.height - 40); // 100 from the left, 40 from the top
            const back = userBoxToShown({ x: ux, y: uy, width: 0, height: 0 }, W, H, rotation, 5, 7);

            expect([back.x, back.y]).toEqual([100, 40]);
        }
    });

    it('turns a box of the file into a box of what is shown', () => {
        // The file's lower left 100x50 box, on a page turned 90, is the shown page's upper left, 50 wide and 100 tall.
        expect(userBoxToShown({ x: 0, y: 0, width: 100, height: 50 }, W, H, 90)).toEqual({ x: 0, y: 0, width: 50, height: 100 });
        expect(userBoxToShown({ x: 0, y: 0, width: 100, height: 50 }, W, H, 0)).toEqual({ x: 0, y: H - 50, width: 100, height: 50 });
    });
});

describe('picking and moving', () => {
    it('picks the topmost on a page', () => {
        const list = [rect(0, 0, 0, 100, 100, { fillColor: '#f00' }), rect(0, 20, 20, 30, 30, { fillColor: '#0f0' }), rect(1, 20, 20, 30, 30, { fillColor: '#00f' })];

        expect(pickAnnotation(list, 0, 30, 30)).toBe(list[1]);
        expect(pickAnnotation(list, 0, 80, 80)).toBe(list[0]);
        expect(pickAnnotation(list, 1, 30, 30)).toBe(list[2]);
        expect(pickAnnotation(list, 0, 300, 300)).toBeNull();
    });

    it('lets a hollow shape be picked by its outline, and what is inside by whatever is there', () => {
        const hollow = rect(0, 0, 0, 100, 100);

        expect(hitAnnotation(hollow, 1, 50)).toBe(true);
        expect(hitAnnotation(hollow, 50, 50)).toBe(false);
    });

    it('picks a line within its width and a bit of slack', () => {
        const line: PdfAnnotation = { id: 'l', page: 0, type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, color: '#000', strokeWidth: 2 };

        expect(hitAnnotation(line, 50, 3)).toBe(true);
        expect(hitAnnotation(line, 50, 20)).toBe(false);
        expect(hitAnnotation(line, 150, 0)).toBe(false);
    });

    it('moves every kind of annotation', () => {
        expect(moveAnnotation(rect(0), 5, 6)).toMatchObject({ x: 15, y: 16 });
        expect(moveAnnotation({ id: 'l', page: 0, type: 'arrow', x1: 0, y1: 0, x2: 10, y2: 10, color: '#000', strokeWidth: 1 }, 1, 2)).toMatchObject({ x1: 1, y1: 2, x2: 11, y2: 12 });
        expect(
            moveAnnotation(
                {
                    id: 'd',
                    page: 0,
                    type: 'draw',
                    points: [
                        [0, 0],
                        [5, 5]
                    ],
                    color: '#000',
                    strokeWidth: 1
                },
                2,
                3
            )
        ).toMatchObject({
            points: [
                [2, 3],
                [7, 8]
            ]
        });
    });

    it('resizes a box, holds a picture to its shape on request, and never to nothing', () => {
        const image: PdfAnnotation = { id: 'i', page: 0, type: 'image', x: 0, y: 0, width: 200, height: 100, dataUrl: '' };

        expect(resizeAnnotation(rect(0), { x: 0, y: 0, width: 80, height: 40 })).toMatchObject({ width: 80, height: 40 });
        expect(resizeAnnotation(image, { x: 0, y: 0, width: 100, height: 100 }, true)).toMatchObject({ width: 100, height: 50 });
        expect(resizeAnnotation(rect(0), { x: 0, y: 0, width: 0, height: 0 })).toMatchObject({ width: 4, height: 4 });
    });

    it('measures a line or a stroke with its width', () => {
        expect(boundsOf({ id: 'l', page: 0, type: 'line', x1: 10, y1: 10, x2: 30, y2: 20, color: '#000', strokeWidth: 4 })).toEqual({ x: 8, y: 8, width: 24, height: 14 });
        expect(
            boundsOf({
                id: 'd',
                page: 0,
                type: 'draw',
                points: [
                    [0, 0],
                    [10, 20]
                ],
                color: '#000',
                strokeWidth: 2
            })
        ).toEqual({ x: -1, y: -1, width: 12, height: 22 });
    });
});

describe('annotations follow their page', () => {
    const list = [rect(0), rect(1), rect(2), rect(3)];

    it('drop with a deleted page and the later ones move up', () => {
        expect(afterDeletePage(list, 1).map((a) => a.page)).toEqual([0, 1, 2]);
        expect(afterDeletePage(list, 1).map((a) => a.id)).toEqual(['r0', 'r2', 'r3']);
    });

    it('go with a page that moves, forwards and back', () => {
        expect(afterMovePage(list, 0, 2).map((a) => a.page)).toEqual([2, 0, 1, 3]);
        expect(afterMovePage(list, 3, 1).map((a) => a.page)).toEqual([0, 2, 3, 1]);
        expect(afterMovePage(list, 1, 1).map((a) => a.page)).toEqual([0, 1, 2, 3]);
    });

    it('move down for a page inserted before them', () => {
        expect(afterInsertPage(list, 2).map((a) => a.page)).toEqual([0, 1, 3, 4]);
        expect(afterInsertPage(list, 1, 2).map((a) => a.page)).toEqual([0, 3, 4, 5]);
    });
});

describe('colours', () => {
    it('reads hex and rgb', () => {
        expect(parseColor('#f00')).toEqual({ r: 1, g: 0, b: 0 });
        expect(parseColor('#00ff00')).toEqual({ r: 0, g: 1, b: 0 });
        expect(parseColor('rgb(0, 0, 255)')).toEqual({ r: 0, g: 0, b: 1 });
        expect(parseColor('rgba(255,255,255,0.5)')).toEqual({ r: 1, g: 1, b: 1 });
        expect(parseColor('nonsense')).toEqual({ r: 0, g: 0, b: 0 });
    });
});
