import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function createPdf(title, description, data) {
    // Create a new PD F document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();

    //  fonts and text size
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const boldFontSize = fontSize + 8; // Increase font size for title
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // 0 new page and reset yOffset
    let yOffset = pageHeight - 50; // Initial yOffset
    const addNewPage = () => {
        page = pdfDoc.addPage();
        yOffset = pageHeight - 50; // Reset yOffset for new page
    };

    //make it good
    const titleWidth = helveticaFont.widthOfTextAtSize(title, boldFontSize);
    const titleX = (pageWidth - titleWidth) / 2;
    page.drawText(title, {
        x: titleX,
        y: yOffset,
        size: boldFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        bold: true,
    });
    yOffset -= boldFontSize + 20; // Increase yOffset for description

    // description 
    let descriptionLines = description.split(/\r?\n/);
    for (let line of descriptionLines) {
        const descriptionWidth = helveticaFont.widthOfTextAtSize(line, fontSize);
        const descriptionX = (pageWidth - descriptionWidth) / 2;
        page.drawText(line, {
            x: descriptionX,
            y: yOffset,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
        yOffset -= fontSize + 5; // Move to the next line
    }
    addNewPage(); // Move to the next page

    
    let index = 1;
    for (let i = 0; i < data.length; i++) {
        const { amenitieType, res } = data[i];

        // Check if there is enough space on the current page
        if (yOffset < 50) {
            addNewPage(); // Add new page if there isn't enough space
        }

        // Draw index and amenity type
        page.drawText(`${index}. ${amenitieType}:`, {
            x: 50,
            y: yOffset,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
    
         //console.log(index,amenitieType);
        // Draw res values
        for (let j = 0; j < res.length; j++) {
            const item = res[j];
            yOffset -= fontSize + 2; // Adjust yOffset for the next item

            // Check if there is enough space for the next item
            if (yOffset < 50) {
                addNewPage(); // Add new page if there isn't enough space
            }

            page.drawText(`- ${item}`, {
                x: 70,
                y: yOffset,
                size: fontSize,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
        }

        index++;
        yOffset -= 10; // Add some space between amenity types
    }

    //PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Save the PDF
    return pdfBytes;
}

export default createPdf;
