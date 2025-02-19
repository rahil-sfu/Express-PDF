const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

// Use memory storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to display the upload form
router.get('/', (req, res) => {
  res.render('pdfeditor', { title: 'PDF Editor' });
});

router.post('/editor', upload.array('pdf', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.render('pdfeditor', {
      title: 'PDF Editor',
      error: 'Please select at least one PDF file to upload.',
    });
  } else {
    try {
      // Create a new PDF document that will contain all pages
      const mergedPdf = await PDFDocument.create();

      // Loop over each uploaded file and copy its pages into the merged PDF
      for (const file of req.files) {
        if (!file || !file.buffer) {
          console.warn('Skipping file due to missing buffer:', file);
          continue; // Skip to the next file if buffer is missing
        }

        try {
          const pdfDoc = await PDFDocument.load(file.buffer);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (pdfLoadError) {
          console.error(
            'Error loading/processing PDF file:',
            file.originalname,
            pdfLoadError
          );
          // If a specific file causes an error, render the pdfeditor view with an error message
          return res.render('pdfeditor', {
            title: 'PDF Editor',
            error: `Error loading PDF file ${file.originalname || 'unknown'}: ${pdfLoadError.message}`,
          });
        }
      }

      // Save the merged PDF and convert it to a Data URI
      const mergedPdfBytes = await mergedPdf.save();
      const dataUri = `data:application/pdf;base64,${Buffer.from(
        mergedPdfBytes
      ).toString('base64')}`;

      // Pass the merged PDF Data URI to the editor view
      res.render('main-editor', {
        title: 'PDF Editor',
        dataUri: dataUri,
      });
    } catch (err) {
      console.error('Error during PDF merging:', err);
      res.render('pdfeditor', {
        title: 'PDF Editor',
        error: `Error merging PDFs: ${err.message}`,
      });
    }
  }
});

module.exports = router;