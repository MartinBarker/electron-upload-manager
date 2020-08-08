var newUploadFiles = {}
/* 
run this code when the page first loads 
*/
updateUploadListDisplay()

//var $ = jQuery = require('jquery');
require('datatables.net-dt')();
require('datatables.net-rowreorder-dt')();

var dataset1 = [
    ["1", `<input type="checkbox">`, "Ashton Cox", "Junior Technical Author"],
    ["2", `<input type="checkbox">`, "Cedric Kelly", "Senior Javascript Developer"],
    ["3", `<input type="checkbox">`, "Airi Satou", "Accountant"],
];

var table = $('#example').DataTable({
    columnDefs: [ {
        "targets": 1,
        "orderable": false,
        "className": 'selectall-checkbox',
        } ],
    responsive: true,
    data: dataset1,
    "dom": "t",
    select: {
        style: 'multi',
        selector: 'td:nth-child(2)'
    },
    rowReorder: true,
    
    rowReorder: {
        selector: 'td:nth-child(1)'
    }
});

//select all checkbox clicked
$('#selectAll').on('click', function(event){
    //get status of select all box (checked == true, unchecked == false)
    var selectAllStatus = document.getElementById('selectAll').checked
    //if status == false and the user is trying to deselect all
    if(!selectAllStatus){
        //deselect all rows
        //table.rows().deselect();
        //uncheck all rows
        var rows = table.rows().nodes();
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    
    }else{
        //if status == true and the user is trying to select all
        // Get all rows with search applied
        var rows = table.rows().nodes();
        // Check/uncheck checkboxes for all rows in the table
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
        //trigger select all button
        //table.button(4).trigger()
    }

    
 });
//row-reorder
table.on( 'row-reorder', function ( e, diff, edit ) {
    var result = 'Reorder started on row: '+edit.triggerRow.data()[1]+'<br>';

    for ( var i=0, ien=diff.length ; i<ien ; i++ ) {
        var rowData = table.row( diff[i].node ).data();

        result += rowData[1]+' updated to be in position '+
            diff[i].newData+' (was '+diff[i].oldData+')<br>';
    }

    console.log(result );
} );


/*
Event Listeners
*/

//newUpload modal file drag & drop event listener
var newUploadBox = document.getElementById('newUploadFilesInput')
newUploadBox.addEventListener('drop', () => newUploadFileDropEvent(event))

newUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});
newUploadBox.addEventListener('dragenter', (event) => {
    console.log('NEWUPLOAD File is in the Drop Space');
    //newUploadBox.style.backgroundColor = '#cccccc';
});

newUploadBox.addEventListener('dragleave', (event) => {
    console.log('NEWUPLOAD File has left the Drop Space');
    //newUploadBox.style.backgroundColor = '#ffffff'
});

//when upload modal is hidden, clear input values
$('#uploadModal').on('hidden.bs.modal', function (e) {
    document.getElementById('newUploadImageFileList').innerHTML = ''
    document.getElementById('newUploadAudioFileList').innerHTML = ''
    $(this)
        .find("input,textarea,select")
        .val('')
        .end()
        .find("input[type=checkbox], input[type=radio]")
        .prop("checked", "")
        .end();
})
//when upload modal is shown, click input field
$('#uploadModal').on('shown.bs.modal', function (e) {
    //if enter key is pressed, click confirm
    $(document).keypress(function (e) {
        if (e.which == 13) {
            document.getElementById('createUploadButton').click()
        }
    })
    //make input field focused
    $('input:text:visible:first', this).focus();
})
//whn delete modal is shown, if enter is pressed -> click confirm
$('#deleteModal').on('shown.bs.modal', function (e) {
    //if enter key is pressed, click confirm
    $(document).keypress(function (e) {
        if (e.which == 13) {
            document.getElementById('deleteUploadConfirm').click()
        }
    })
})
/*
Function
*/
function getDatatableContents(datatableID) {
    var table = $(`#${datatableID}`).DataTable();
    var data = table.rows().data();
    console.log('The table has ' + data.length );
    for(var i = 0; i < data.length; i++){
        console.log(`row[${i}] = `, data[i])
    }

}

function getRandomNumbers() {
    const typedArray = new Uint8Array(5);
    const randomValues = window.crypto.getRandomValues(typedArray);
    return randomValues.join('');
}

async function addNewUpload(uploadTitle) {
    console.log('addNewUpload() newUploadFiles = ', newUploadFiles)
    //get unique uploadId timestamp
    var uploadId = getRandomNumbers()

    //get unique uploadNumber
    let uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    let uploadNumber = 1
    if (uploadList != null) {
        //while upload already exists with that key
        while (uploadList[`upload-${uploadNumber}`]) {
            uploadNumber++
        }
        //uploadNumber = (Object.keys(uploadList).length)+1;
    }

    //if title is null, set to default
    if (uploadTitle.length < 1) {
        uploadTitle = `upload-${uploadNumber}`
    }

    let uploadKey = `upload-${uploadNumber}`
    let uploadObj = { 'title': uploadTitle, 'files': newUploadFiles }
    newUploadFiles = {}

    console.log("+ addNewUpload() uploadKey = ", uploadKey, ", uploadObj = ", uploadObj, ", uploadNumber = ", uploadNumber)
    //add to uploadList obj
    await addToUploadList(uploadKey, uploadObj, uploadNumber)
    //update uploadListDisplay
    updateUploadListDisplay()
}

async function removeUploadFromUploadList(uploadId) {
    console.log("delete ", uploadId)
    let uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    console.log("delte(0 before = uploadList = ", uploadList)
    delete uploadList[uploadId]
    console.log("REM(0 after = ", uploadList)
    await localStorage.setItem('uploadList', JSON.stringify(uploadList))

}

async function deleteUpload(uploadId) {
    console.log("deleteUpload() uploadId = ", uploadId)
    //when delete button is clicked

    document.getElementById("deleteUploadConfirm").addEventListener('click', confirmDelete, { passive: false });

    async function confirmDelete() {
        console.log("deleteUpload() DELETE uploadId = ", uploadId)
        //remove card display
        document.getElementById(uploadId).remove()
        //remove card from db
        await removeUploadFromUploadList(uploadId)
        //remove event listener
        document.getElementById("deleteUploadConfirm").removeEventListener('click', confirmDelete);
    }




    //async function confirmDelete() {

    //}

}


async function getLocalStorage(input) {
    var item = await JSON.parse(localStorage.getItem(input))
    console.log(item)
}

async function createDataset(uploadFiles, uploadNumber){
    return new Promise(async function (resolve, reject) {
        console.log("createDataset() uploadFiles = ", uploadFiles)
        var imageSelectionForm = `<select name="cars">`
        try{
            //for each image
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var imagFilename = `${uploadFiles.images[x].name}`
                imageSelectionForm = imageSelectionForm + `<option value="${imagFilename}">${imagFilename}</option>`  
            }
            //add image dropdown selection to table
            var imageDiv
        }catch(err){

        }
        
        imageSelectionForm = imageSelectionForm + `</select>`
        
        let dataSet = []
        let fileCount = 1;
        try{
            //for each audio file
            for(var x = 0; x < uploadFiles['audio'].length; x++){
                    var audioObj = uploadFiles['audio'][x]
                    console.log('file = ', audioObj)
                    let rowObj = [
                        fileCount, 
                        '<input type="checkbox">', 
                        audioObj.name, 
                        audioObj.type, 
                        audioObj.length, 
                        imageSelectionForm,
                        'vidoutput', 
                        'vidformat'
                    ]
                    ////order, select, audioFilename, audioFormat, audioLength, Image, videoOutput, videoFormat
                    fileCount++
                    dataSet.push(rowObj)
                //}
            }
        }catch(err){

        }

        //create image dropdown selection
        var uploadImageSelectionRowValue = document.createElement('select')
        uploadImageSelectionRowValue.setAttribute('name', `upload-${uploadNumber}-imageOptions`)
        uploadImageSelectionRowValue.setAttribute('id', `upload-${uploadNumber}-imageOptions`)
        try{
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var rowImg = document.createElement('option')
                rowImg.setAttribute('value', uploadFiles.images[x].name)
                rowImg.innerHTML = `${uploadFiles.images[x].name}`
                uploadImageSelectionRowValue.appendChild(rowImg)
            }
            //add image dropdown selection to table
            var imageDiv
        }catch(err){

        }
        

        resolve(dataSet)
    })
}

async function createNewUploadCard(uploadTitle, uploadNumber, uploadFiles) {
    console.log('createNewUploadCard() uploadFiles = ', uploadFiles)
    return new Promise(async function (resolve, reject) {
        
        $("#uploadList").append(`
            
            <div id="upload-${uploadNumber}" class="card ml-5 mr-5 mt-5 uploadCard ">
                <!-- Header -->
                <div class="card-header expandable">
                    <a data-toggle="collapse" href="#collapse-example-${uploadNumber}" aria-expanded="false" aria-controls="collapse-example-${uploadNumber}" class='collapsed' id="heading-example-${uploadNumber}" >
                        <i class="rotate fa fa-chevron-down "></i>
                        ${uploadTitle}
                    </a>

                    <a style='cursor: pointer;'  data-toggle="modal" data-target="#deleteModal" onClick='deleteUpload("upload-${uploadNumber}")' > 
                        <i style='color:red' class="fa fa-close pull-right"></i>
                    </a>
                </div>


                <!-- Body -->
                <div id="collapse-example-${uploadNumber}" class="collapse" aria-labelledby="heading-example-${uploadNumber}">
                    <div class="card-body">
                        Table:
                        <!-- files table -->
                        <table id="upload_${uploadNumber}_table" class="display filesTable" cellspacing="2" width="100%">
                        <thead>
                            <tr> //order, select, audioFilename, audioFormat, audioLength, Image, videoOutput, videoFormat
                                <th class='order'>#</th>
                                <th style="text-align: center;"><input id='upload_${uploadNumber}_table-selectAll' type="checkbox"></th>
                                <th id='upload_${uploadNumber}_audioCol'>Audio</th>
                                <th>Format</th>
                                <th>Length</th>
                                <th id='upload_${uploadNumber}_tableImageSelectionColHeader'>
                                </th>
                                <th>
                                    <select name="videoFormats">
                                        <option value="videoFormat1">videoFormat1</option>
                                        <option value="videoFormat2">videoFormat2</option>
                                    </select>
                                </th>
                                <th>Video Format</th>
                            </tr>
                        </thead>
                    </table>
                    </div>
                </div>
            </div>
            
        ` );
         //create image dropdown selection
         var uploadImageSelectionColHeader = document.createElement('select')
         uploadImageSelectionColHeader.setAttribute('id', `upload-${uploadNumber}-imageOptionsCol`)
         try{
            console.log('uploadFiles.images = ', uploadFiles.images)
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var rowImg = document.createElement('option')
                console.log('uploadFiles.images[x] = ', uploadFiles.images[x])
                rowImg.setAttribute('value', uploadFiles.images[x].name)
                rowImg.innerHTML = `${uploadFiles.images[x].name}`
                uploadImageSelectionColHeader.appendChild(rowImg)
            }
         }catch(err){
 
         }
        //set image selection form header
        document.getElementById(`upload_${uploadNumber}_tableImageSelectionColHeader`).appendChild(uploadImageSelectionColHeader)
        
        //create dataset
        let upload_table_files_dataset = await createDataset(uploadFiles, uploadNumber)
        
        //create table
        var upload_table = $(`#upload_${uploadNumber}_table`).DataTable({
            columnDefs: [ 
                {
                    "targets": 0,
                    "orderable": false,
                    "className": "text-center",
                },
                {
                    "targets": 1,
                    "orderable": false,
                    "className": 'selectall-checkbox',
                    "className": "text-center",
                },
                {
                    "targets": 2,
                    //"orderable": false,
                    "className": "text-left",
                },
                {
                    "targets": 3,
                    "orderable": false,
                    "className": "text-center",
                },
                {
                    "targets": 4,
                    "orderable": false,
                    "className": "text-center",
                },
                {
                    "targets": 5,
                    "orderable": false,
                    "className": "text-center",
                },
                {
                    "targets": 6,
                    "orderable": false,
                    "className": "text-center",
                },
                {
                    "targets": 7,
                    "orderable": false,
                    "className": "text-center",
                }, 
            ],
            responsive: true,
            data: upload_table_files_dataset,
            "dom": "t",
            select: {
                style: 'multi',
                selector: 'td:nth-child(2)'
            },
            rowReorder: true,
            
            rowReorder: {
                selector: 'td:nth-child(1)'
            }
        });

        //image selection changed
        $('#upload-1-imageOptionsCol').change(function(e) {
            console.log(`upload-1-imageOptionsCol clicked`)
            
           
            upload_table.rows().eq(0).each( function ( index ) {
                var row = upload_table.row( index );
             
                var data = row.data();
                //console.log("row = ", row)
                console.log("data = ", data)
                data[2] = 'ex'
            } );
            
            upload_table.draw();
        });
        //audio sort clicked
        $(`#upload_${uploadNumber}_audioCol`).on('click', function(event){
            console.log('audio sort clicked')
        })
        //select all checkbox clicked
        $(`#upload_${uploadNumber}_table-selectAll`).on('click', function(event){
            var selectAllStatus = document.getElementById(`upload_${uploadNumber}_table-selectAll`).checked
                var rows = upload_table.rows().nodes();
                $('input[type="checkbox"]', rows).prop('checked', this.checked);   
         });
        //row-reorder
        upload_table.on( 'row-reorder', function ( e, diff, edit ) {
            var result = 'Reorder started on row: '+edit.triggerRow.data()[1]+'<br>';
        
            for ( var i=0, ien=diff.length ; i<ien ; i++ ) {
                var rowData = upload_table.row( diff[i].node ).data();
        
                result += rowData[1]+' updated to be in position '+
                    diff[i].newData+' (was '+diff[i].oldData+')<br>';
            }
        
            console.log(result );
        } );

        resolve()
    })
}

async function updateUploadListDisplay() {
    let uploadListDisplay = document.getElementById('uploadList')

    //get uploadList from localstorage
    var uploadList = await JSON.parse(localStorage.getItem('uploadList'))

    console.log('~ updateUploadListDisplay() uploadList = ', uploadList)

    //if uploadList exists
    if (uploadList != null) {

        //for each object in uploadList
        for (const [key, value] of Object.entries(uploadList)) {
            let uploadId = key
            let uploadTitle = value.title
            let uploadFiles = value.files
            uploadNumber = key.split('-')[1]
            //console.log('~ updateDisplay() uploadNumber = ', uploadNumber)
            //if div with id = upload-${uploadNumber} does not exist:
            var uploadObj = document.getElementById(`upload-${uploadNumber}`)
            //console.log("~ updateUploadListDisplay() uploadObj = ", uploadObj)
            if (uploadObj == null) {
                //console.log('~ updateUploadListDisplay() add to display: ', key, ', ', value)
                await createNewUploadCard(uploadTitle, uploadNumber, uploadFiles)
            } else {
                //console.log('~ updateUploadListDisplay() dont add already visible: ', key, ', ', value)
            }




            //console.log('updateUploadListDisplay() newUploadCard = ', newUploadCard)

            //uploadListDisplay.appendChild(newUploadCard);
            //console.log(`    ${key}: ${value}`);
            //uploadListDisplay.innerHTML = uploadListDisplay.innerHTML + `[${key}]-${JSON.stringify(value)}]<br><hr>`
        }
    } else {
        //console.log('~ updateUploadListDisplay() uploadList = null')
    }

}

async function addToUploadList(uploadKey, uploadValue) {
    return new Promise(async function (resolve, reject) {

        var uploadList = await JSON.parse(localStorage.getItem('uploadList'))

        //if uploadList does not exists
        if (uploadList == null) {
            //create new uploadList object
            let newUploadListObj = {}
            //set uploadList in localstorage
            await localStorage.setItem('uploadList', JSON.stringify(newUploadListObj))
            uploadList = await JSON.parse(localStorage.getItem('uploadList'))
        }

        //if uploadKey does not exist
        if (uploadList[uploadKey] == null) {
            console.log(`setting ${uploadKey} in uploadList to be = `, uploadValue)
            uploadList[uploadKey] = uploadValue
            uploadList[uploadKey]['audio'] = uploadValue['audio']
        } else {
            //console.log(`${uploadKey} does exist in uploadList, so update pre-existing obj`)
        }

        console.log("++ addToUploadList() done uploadList = ", uploadList)
        let result = await localStorage.setItem('uploadList', JSON.stringify(uploadList))
        console.log('result = ', result)

        var tempuploadList = await JSON.parse(localStorage.getItem('uploadList'))
        console.log('tempuploadList = ', tempuploadList)
        resolve('done')
    })
}



async function newUploadFileDropEvent(event) {
    event.preventDefault();
    event.stopPropagation();

    //sort all files into audio / images 
    var fileList = { 'images': [], 'audio': [] }
    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path 
        if ((f.type).includes('image')) {
            //fileList.images.push({'path':f.path, 'type':f.type, 'name':f.name})
            fileList.images.push({ 'path': f.path, 'type': f.type, 'name': f.name })

        } else if ((f.type).includes('audio')) {
            var splitType = (f.type).split('/')
            var audioFormat = splitType[1]
            //if audioformat is not in object
            //if (!fileList.audio[audioFormat]) {
            //    fileList.audio[audioFormat] = []
            //}
            //get audio length       
            let audioLength = await getDuration(f.path)
            //let audioLength = getAudioDurationInSeconds(f.path).then((duration) => {
            audioLength = Math.round((audioLength/60) * 100) / 100
            console.log('audioLength = ', audioLength)
            //    return(duration);
            //});
            fileList.audio.push({ 'path': f.path, 'type': audioFormat, 'name': f.name, 'length':audioLength })
        }
    }
    newUploadFiles = fileList
    console.log('newUploadFiles = ', newUploadFiles)

    //display files in UI
    var imageFilesHtml = ''
    var audioFilesHtml = ''
    for (const [key, value] of Object.entries(newUploadFiles)) {
        console.log('key = ', key, ', value = ', value)
        if (key == 'images') {
            for (var i = 0; i < value.length; i++) {
                imageFilesHtml = imageFilesHtml + `${value[i]['name']} <br>`
            }

        } else if (key == 'audio') {
            //for (const [audioFormat, audioFiles] of Object.entries(newUploadFiles['audio'])) {
                for (var x = 0; x < value.length; x++) {
                    //console.log('f = ', audioFiles[x]['name'])
                    audioFilesHtml = audioFilesHtml + `${value[x]['name']} <br>`
                }
            //}
        }
    }

    document.getElementById('newUploadImageFileList').innerHTML = imageFilesHtml
    document.getElementById('newUploadAudioFileList').innerHTML = audioFilesHtml

    //add file to uploadList object
    //addNewUpload(fileList)
}


function getDuration(src) {
    return new Promise(function(resolve) {
        var audio = new Audio();
        $(audio).on("loadedmetadata", function(){
            resolve(audio.duration);
        });
        audio.src = src;
    });
}

/*
for (var i = 0; i < uploadsOnPage.length; i++) {
    var uploadElement = uploadsOnPage[i]
    //get classes in this element
    var uploadElementClasses = uploadElement.classList
    //get uploadNumber from html class
    for(var value of uploadElementClasses.values()) {
        if(value.includes('upload-')){
            var valueStr = value.toString()
            var uploadNumber = valueStr.split("-")[1]
        }
    }

    //event listener for when files are dropped
    uploadElement.addEventListener('drop', () => fileDropEvent(event))

    uploadElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    uploadElement.addEventListener('dragenter', (event) => {
        console.log('File is in the Drop Space');
    });

    uploadElement.addEventListener('dragleave', (event) => {
        console.log('File has left the Drop Space');
    });

    //uploadCardEventListeners(uploadElement)

}
*/

/*
document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    //sort all files into audio / images
    var fileList = {'images':[], 'audio':[]}
    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        //console.log('File Path of dragged files: ', f.path)
        if((f.type).includes('image')){
            fileList.images.push({'path':f.path, 'type':f.type, 'name':f.name})
        }else if((f.type).includes('audio')){
            var splitType = (f.type).split('/')
            var audioFormat = splitType[1]
            if(!fileList.audio[audioFormat]){
                fileList.audio[audioFormat] = []
            }
            fileList.audio[audioFormat].push({'path':f.path, 'type':f.type, 'name':f.name})
        }
    }

    //add upload to global uploads[] list

    addUploadCard(globalUploadListCount, fileList)
    globalUploadListCount++

    //ffmpegTest()

    //var node = document.createElement("LI");
    //var textnode = document.createTextNode("New Upload");
    //node.appendChild(textnode);
    //document.getElementById("uploadList").appendChild(node);
});

function addUploadCard(number, fileList){
    console.log("fileList = ", fileList)
    //create elements

    //card
    var card = document.createElement('div')
    card.className = 'card ml-5 mr-5 mt-5'

    //cardHeader
    var cardHeader = document.createElement('div')
    cardHeader.className = 'card-header'
        //row
        var row = document.createElement('div')
        row.className = 'row'
            //col expandable
            var colExpandable = document.createElement('div')
            colExpandable.className = 'col expandable'
                //a collapseable item
                var aItem = document.createElement('a')
                aItem.setAttribute('data-toggle', 'collapse')
                aItem.setAttribute('href', `#collapse-example${number}`)
                aItem.setAttribute('aria-expanded', 'true')
                aItem.setAttribute('aria-controls', `collapse-example${number}`)
                aItem.setAttribute('id', 'heading-example')
                aItem.setAttribute('class', 'd-block')
                    //expand/collapse icon
                    var expandIcon = document.createElement('i')
                    expandIcon.className = 'fa fa-chevron-down'
            //col expandable 2
            var colExpandable2 = document.createElement('div')
            colExpandable2.className = 'col expandable'
            colExpandable2.setAttribute('data-toggle', 'collapse')
            colExpandable2.setAttribute('href', `#collapse-example${number}`)
            colExpandable2.setAttribute('aria-expanded', 'true')
                //card title
                var cardHeaderTitle = document.createElement('p')
                cardHeaderTitle.innerText = `Upload #${number}`
            //col expandable 3
            var colExpandable3 = document.createElement('div')
            colExpandable3.className = 'col'
                //close button
                var closeIcon = document.createElement('i')
                closeIcon.className = 'fa fa-close pull-right'

    //collapseableElement
    var collapseableElement = document.createElement('div')
    collapseableElement.className = 'collapse'
    collapseableElement.setAttribute('id', `collapse-example${number}`)
    collapseableElement.setAttribute('aria-labelledby', 'heading-example')
        //cardBody
        var cardBody = document.createElement('div')
        cardBody.className = 'card-body'
            //cardBodyTitle
            var cardBodyTitle = document.createElement('div')
            cardBodyTitle.className = 'card-title'
            cardBodyTitle.innerHTML = 'Card Body Title'
            //cardBodyDescription
            var cardBodyDescription = document.createElement('div')
            cardBodyDescription.className = 'card-text'
            cardBodyDescription.innerHTML = 'Card Body Description'
            //imageSelection
            var imageDiv = document.createElement('div')
                //imageSelectionForm
                var imageSelectionForm = document.createElement('form')
                    //selectImageText
                    var selectImageText = document.createElement('p')
                    selectImageText.innerText = 'Select Image:'
                    //for each image in fileList
                    var imageSelectionCards = []
                    for(var i = 0; i < fileList['images'].length; i++){
                        //imageSelectionDiv
                        var imageSelectionDiv = document.createElement('div')
                        imageSelectionDiv.className = 'border card-body'
                            //radio input
                            var imageSelectionInput = document.createElement('input')
                            imageSelectionInput.setAttribute('type', 'radio')
                            imageSelectionInput.setAttribute('value', 'radio')
                            imageSelectionInput.setAttribute('id', `${number}-contactChoice${i}`)
                            imageSelectionInput.setAttribute('name', `contact`)
                            imageSelectionInput.setAttribute('value', fileList['images'][i]['name'])
                            //label
                            var imageSelectionLabel = document.createElement('label')
                            imageSelectionLabel.setAttribute('for', `${number}-contactChoice${i}`)
                            imageSelectionLabel.innerText = `${fileList['images'][i]['name']}  `
                                //img
                                var imageSelectionImg = document.createElement('img')
                                imageSelectionImg.setAttribute('height', '100px')
                                imageSelectionImg.setAttribute('width', '100px')
                                imageSelectionImg.setAttribute('src', `${fileList['images'][i]['path']}`)
                        imageSelectionDiv.appendChild(imageSelectionInput)
                        imageSelectionDiv.appendChild(imageSelectionLabel)
                        imageSelectionLabel.appendChild(imageSelectionImg)

                        imageSelectionCards.push(imageSelectionDiv)
                    }

            //tracklist
            var tracklistDiv = document.createElement('div')
            //for each audio type
            var audioSelectionTypes = []
            for (const [key, value] of Object.entries(fileList['audio'])) {
                //select audio form
                var audioSelectionForm = document.createElement('form')
                    //select audio text
                    var selectAudioText = document.createElement('p')
                    selectAudioText.innerText = `Select ${key} audio files:`
                    //append text to form
                    audioSelectionForm.appendChild(selectAudioText)
                    var audioTrackSelections = []
                    for(var i = 0; i < value.length; i++){
                        console.log('track = ', value[i])
                        var trackSelectionDiv = document.createElement('div')
                        trackSelectionDiv.className = 'border card-body'
                            //radio input bubble
                            var trackSelectionInput = document.createElement('input')
                            trackSelectionInput.setAttribute('type', 'radio')
                            trackSelectionInput.setAttribute('value', 'radio')
                            trackSelectionInput.setAttribute('id', `${number}-${key}-contactChoice${i}`)
                            trackSelectionInput.setAttribute('name', `contact`)
                            trackSelectionInput.setAttribute('value', value[i]['name'])
                            //radio input label
                            var trackSelectionLabel = document.createElement('label')
                            trackSelectionLabel.setAttribute('for', `${number}-${key}-contactChoice${i}`)
                            trackSelectionLabel.innerText = `${value[i]['name']}  `
                        trackSelectionDiv.appendChild(trackSelectionInput)
                        trackSelectionDiv.appendChild(trackSelectionLabel)

                        audioSelectionForm.appendChild(trackSelectionDiv)
                    }
                    //append download button
                    var renderButton = document.createElement('div')
                    renderButton.innerText = `Render `


                    //append form to list
                    audioSelectionTypes.push(audioSelectionForm)
            }


    //append elements
    document.getElementById("uploadList").appendChild(card);
    card.appendChild(cardHeader)
        cardHeader.appendChild(row)
            row.appendChild(colExpandable)
                colExpandable.appendChild(aItem)
                    aItem.appendChild(expandIcon)
            row.appendChild(colExpandable2)
                colExpandable2.appendChild(cardHeaderTitle)
            row.appendChild(colExpandable3)
                colExpandable3.appendChild(closeIcon)
    card.appendChild(collapseableElement)
        collapseableElement.appendChild(cardBody)
            //cardBody.appendChild(cardBodyTitle)
            //cardBody.appendChild(cardBodyDescription)
            cardBody.appendChild(imageDiv)
                imageDiv.appendChild(imageSelectionForm)
                    imageSelectionForm.appendChild(selectImageText)
                        for(var q = 0; q < imageSelectionCards.length; q++){
                            imageSelectionForm.appendChild(imageSelectionCards[q])
                        }
            cardBody.appendChild(tracklistDiv)
                for(var i = 0; i < audioSelectionTypes.length; i++){
                    tracklistDiv.appendChild(audioSelectionTypes[i])
                }


}

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {
    console.log('File is in the Drop Space');
});

document.addEventListener('dragleave', (event) => {
    console.log('File has left the Drop Space');
});

async function ffmpegTest(){
    console.log('ffmpeg-test')
    //require the ffmpeg package so we can use ffmpeg using JS
    const ffmpeg = require('fluent-ffmpeg');
    //Get the paths to the packaged versions of the binaries we want to use
    const ffmpegPath = require('ffmpeg-static').replace(
        'app.asar',
        'app.asar.unpacked'
    );
    const ffprobePath = require('ffprobe-static').path.replace(
        'app.asar',
        'app.asar.unpacked'
    );
    //tell the ffmpeg package where it can find the needed binaries.
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    var audioPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\3. Yaldut.flac"
    var imgPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\front.jpg"
    var videoPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\Yaldut.mp4"
    var outputPath = "C:\\Users\\marti\\Documents\\martinradio\\uploads\\israel song festival 1979\\output.m4v"

    let proc = await ffmpeg()
    .input(audioPath)
    .input(imgPath)
    // using 25 fps
    .fps(25)
    //audio bitrate
    .audioBitrate('320k')
    //video bitrate
    .videoBitrate('8000k', true) //1080p
    //resolution
    .size('1920x1080')
    // setup event handlers
    .on('end', function() {
        console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
        console.log('an error happened: ' + err.message);
    })
    // save to file
    .save(videoPath);

    //old under not working
    //convert image to video
    var proc = ffmpeg(imgPath)
    // loop for 5 seconds
    .loop(5)
    // using 25 fps
    .fps(25)
    //audio bitrate
    .audioBitrate('128k')
    //video bitrate
    .videoBitrate('8000k', true)
    //resolution
    .size('1920x1080')
    // setup event handlers
    .on('end', function() {
        console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
        console.log('an error happened: ' + err.message);
    })
    // save to file
    .save(outputPath);


    console.log("end of ffmpeg-test")
}
*/
