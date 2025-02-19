// Create a global DataTransfer object to hold the files
var globalDT = new DataTransfer();

$(document).ready(function () {
    var fileInput = $('#pdfs');

    // When files are chosen via the file input
    $('input[name="pdfFile"]').on('change', function () {
        var files = this.files;
        for (var i = 0; i < files.length; i++) {
            // Add each selected file to the global DataTransfer object
            globalDT.items.add(files[i]);
            var url = URL.createObjectURL(files[i]);
            addPdfToList(files[i].name, url);
        }
        // Update the file input's FileList with our global DataTransfer files
        this.files = globalDT.files;
        // Clear the input value (so the same file can be re-selected if needed)
        $(this).val('');
        // Show submit button
        if (globalDT.files.length > 0) {
            $('#pdf-dropzone-form input[type="submit"]').show();
        } else {
            $('#pdf-dropzone-form input[type="submit"]').hide();
        }
    });

    // Drag and drop functionality on the drop zone
    var dropZone = $('#pdf-dropzone');

    dropZone.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    dropZone.on('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    dropZone.on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
        var droppedFiles = e.originalEvent.dataTransfer.files;
        for (var i = 0; i < droppedFiles.length; i++) {
            globalDT.items.add(droppedFiles[i]);
            var url = URL.createObjectURL(droppedFiles[i]);
            addPdfToList(droppedFiles[i].name, url);
        }
        // Update the file input with the merged FileList
        fileInput[0].files = globalDT.files;

        // Show submit button
        if (globalDT.files.length > 0) {
            $('#pdf-dropzone-form input[type="submit"]').show();
        } else {
            $('#pdf-dropzone-form input[type="submit"]').hide();
        }
    });
});

function addPdfToList(name, url) {
    // Append a header ("Selected PDFs") to the .pdfhead div if not already present
    var pdfHead = $('.pdfhead');
    if (pdfHead.children('h1').length === 0) {
        var h1 = $('<h1/>', { text: 'Selected PDFs' })
            .css('color', 'var(--text-color)');
        pdfHead.append(h1);
    }

    // Create a new list item for the PDF file
    var li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    // Create a link element for the file name
    var a = document.createElement("a");
    a.innerText = name;
    a.style.color = "var(--c3)";
    a.href = url;
    a.target = "_blank";

    // Create a delete button for the file
    var button = document.createElement("button");
    button.innerText = "Delete";
    button.className = "btn btn-danger";
    button.onclick = function () {
        li.remove();

        // Remove file from globalDT
        var newDT = new DataTransfer()
        for (let i = 0; i < globalDT.files.length; i++) {
            if (globalDT.files[i].name !== name) {
                newDT.items.add(globalDT.files[i]);
            }
        }
        globalDT = newDT;
        $('#pdfs')[0].files = globalDT.files;


        // If no files remain in the list, hide the submit button and remove the header
        if ($('#pdf-list').children().length === 0) {
            $('#pdf-dropzone-form input[type="submit"]').hide();
            $('.pdfhead h1').remove();
            // Reset our global DataTransfer object
            globalDT = new DataTransfer();
            $('#pdfs')[0].files = globalDT.files;
        }

        // Show submit button
        if (globalDT.files.length > 0) {
            $('#pdf-dropzone-form input[type="submit"]').show();
        } else {
            $('#pdf-dropzone-form input[type="submit"]').hide();
        }
    };

    li.appendChild(a);
    li.appendChild(button);
    a.style.marginRight = "10px";
    a.style.textDecoration = "none";
    button.style.marginLeft = "10px";

    document.getElementById("pdf-list").appendChild(li);

    // Show the "Download Modified PDF" submit button when at least one file is selected
    if (globalDT.files.length > 0) {
        $('#pdf-dropzone-form input[type="submit"]').show();
    } else {
        $('#pdf-dropzone-form input[type="submit"]').hide();
    }
}