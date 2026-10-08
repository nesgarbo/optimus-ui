import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * A small PDF to try the editor on: a letter with a form, and two more pages. Made with pdf-lib, so the demos need no file.
 */
export async function samplePdf(): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const first = doc.addPage([420, 560]);

    first.drawText('Membership form', { x: 32, y: 510, size: 22, font: bold, color: rgb(0.1, 0.1, 0.2) });
    first.drawText('Fill in the fields, then sign and save.', { x: 32, y: 488, size: 11, font, color: rgb(0.35, 0.35, 0.4) });
    first.drawText('Full name', { x: 32, y: 450, size: 10, font });
    first.drawText('Plan', { x: 32, y: 390, size: 10, font });
    first.drawText('Newsletter', { x: 52, y: 335, size: 10, font });
    first.drawText('Comments', { x: 32, y: 295, size: 10, font });
    first.drawText('Signature', { x: 32, y: 150, size: 10, font });
    first.drawLine({ start: { x: 32, y: 110 }, end: { x: 250, y: 110 }, thickness: 0.8, color: rgb(0.4, 0.4, 0.4) });

    const form = doc.getForm();

    form.createTextField('fullName').addToPage(first, { x: 32, y: 418, width: 250, height: 24 });
    form.createDropdown('plan').addToPage(first, { x: 32, y: 358, width: 150, height: 24 });
    form.getDropdown('plan').addOptions(['Free', 'Pro', 'Team']);
    form.createCheckBox('newsletter').addToPage(first, { x: 32, y: 330, width: 16, height: 16 });

    const comments = form.createTextField('comments');

    comments.enableMultiline();
    comments.addToPage(first, { x: 32, y: 200, width: 356, height: 85 });

    for (const n of [2, 3]) {
        const page = doc.addPage([420, 560]);

        page.drawText(`Page ${n}`, { x: 32, y: 510, size: 22, font: bold });
        page.drawText('Rotate it, move it, or draw on it.', { x: 32, y: 486, size: 11, font, color: rgb(0.35, 0.35, 0.4) });
    }

    return doc.save();
}
