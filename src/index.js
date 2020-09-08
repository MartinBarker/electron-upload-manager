var newUploadFiles = {}
/* 
run this code when the page first loads 
*/
updateUploadListDisplay()

//var $ = jQuery = require('jquery');
require('datatables.net-dt')();
require('datatables.net-rowreorder-dt')();

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
    console.log('The table has ' + data.length);
    for (var i = 0; i < data.length; i++) {
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

async function renderIndividual(tempVar){
    console.log('renderIndividual() tempVar = ', tempVar)
}

async function deleteAllUploads(){
    await localStorage.setItem('uploadList', JSON.stringify({}))
    document.getElementById('uploadList').innerHTML = ''
}

async function createDataset(uploadFiles, uploadNumber) {
    return new Promise(async function (resolve, reject) {
        //create img selection part of form
        var imageSelectionOptions = ``
        try {
            //for each image
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var imagFilename = `${uploadFiles.images[x].name}`
                imageSelectionOptions = imageSelectionOptions + `<option value="${imagFilename}">${imagFilename}</option>`
            }
        } catch (err) {

        }
    
        //create dataset
        let dataSet = []
        let fileCount = 1;
        try {
            //for each audio file
            for (var x = 0; x < uploadFiles['audio'].length; x++) {
                var audioObj = uploadFiles['audio'][x]
                
                //create img selection form
                var imgSelectionSelect = `<select style='width:150px' id='upload_${uploadNumber}_table-image-row_${x}' >`
                imgSelectionSelect = imgSelectionSelect + imageSelectionOptions + `</select>`

                //creaet vid output selection
                var videoOutputSelection = `
                <select id='upload_${uploadNumber}_table-vidFormat-row_${x}'>
                    <option value="0">mp4</option>
                    <option value="1">avi</option>
                </select> 
                `

                //create row obj
                let rowObj = {
                    //sequence(leave empty)
                    itemId: fileCount,
                    //select box(leave empty)
                    audio: audioObj.name,
                    format: audioObj.type,
                    length: audioObj.length,
                    imgSelection: imgSelectionSelect,
                    vidFormatSelection: videoOutputSelection
                    //video output(leave empty)
                }
                fileCount++
                dataSet.push(rowObj)
            }
        } catch (err) {

        }

        resolve(dataSet)
    })
}
function setAllVidFormats(uploadNum, rowNum, choice){

    for(var x = 0; x < rowNum; x++){
        document.getElementById(`upload_${uploadNum}_table-vidFormat-row_${x}`).selectedIndex = `${choice}`

        console.log(`document.getElementById('upload_${uploadNum}_table-vidFormat-row_${x}').selectedIndex = ${choice}`)
    }
    //document.getElementById(`upload_1_table-vidFormat-row_2`).selectedIndex = 1

    //document.getElementById(`upload_1_table-vidFormat-row_2`).selectedIndex = 1
}
async function createNewUploadCard(uploadTitle, uploadNumber, uploadFiles) {
    console.log('createNewUploadCard() uploadFiles = ', uploadFiles)
    return new Promise(async function (resolve, reject) {


        $("#uploadList").prepend(`
            
            <div id="upload-${uploadNumber}" class="card uploadCard ">
                <!-- Header -->
                <div class="card-header expandable">
                    <a data-toggle="collapse" href="#collapse-example-${uploadNumber}" aria-expanded="false" aria-controls="collapse-example-${uploadNumber}" class=' ' id="heading-example-${uploadNumber}" >
                        <i class="rotate fa fa-chevron-down " ></i>
                        ${uploadTitle}
                    </a>

                    <a style='cursor: pointer;'  data-toggle="modal" data-target="#deleteModal" onClick='deleteUpload("upload-${uploadNumber}")' > 
                        <i style='color:red' class="fa fa-close pull-right"></i>
                    </a>
                </div>


                <!-- Body -->
                <div id="collapse-example-${uploadNumber}" class="collapse show" aria-labelledby="heading-example-${uploadNumber}">
                    <div class="card-body">
                        
                        <!-- files table -->
                        <table id="upload_${uploadNumber}_table" class="display filesTable" cellspacing="2" width="100%">
                            <thead> 
                                <tr>
                                    <th>sequence</th>
                                    <th style='max-width:3px'>#</th>
                                    <th><input id='upload_${uploadNumber}_table-selectAll' type="checkbox"></th>
                                    <th>Audio</th>
                                    <th style='max-width:58px'>Length</th>
                                    <th style='max-width:400px'>
                                        <div >
                                            <label>Img:</label>
                                            <div id='upload_${uploadNumber}_table-image-col'></div>
                                        </div>
                                    </th>
                                    <th>
                                        Video Format: 
                                        <div>
                                            <select id='upload_${uploadNumber}_table-vidFormat-col'>
                                                <option value="0">mp4</option>
                                                <option value="1">avi</option>
                                            </select> 
                                        </div>
                                    </th>
                                    <!--
                                    <th>Video Output Folder: 
                                        <div >
                                            <button id='upload_${uploadNumber}_table-vidLocationButton'>Select</button>
                                            <input style='display:none' id='upload_${uploadNumber}_table-vidLocation' type="file" webkitdirectory />
                                        </div>
                                    </th>
                                    -->
                                </tr>
                            </thead>
                        </table>

                        <!-- Render Individual Button -->
                        <div class="card ml-5 mr-5 mt-5 renderOption" type='button' onclick="renderIndividual('test')">
                            <div class='card-body'>
                                <i class="uploadIndividual fa fa-plus-circle" aria-hidden="true"></i>Render <a id='upload_${uploadNumber}_numChecked'>0</a> individual files
                            </div>
                        </div>

                        <!-- Render Full Album Button -->
                        <div class="card ml-5 mr-5 mt-5 renderOption">
                            <div class='card-body'>
                                <i class="uploadIndividual fa fa-plus-circle" aria-hidden="true"></i>Render a Full Album video
                                    <br>
                                    Num Tracks: <a id='upload_${uploadNumber}_numCheckedFullAlbum'>0</a>
                                    </br>
                                    Length: 43:22
                                    </br>
                                    Tracklist:
                                    <br>
                                    1. x
                                    <br>
                                    2. x
                                    <br>
                                    3. z
                                    <br>
                                    
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
        ` );

        /* TABLE ATTEMPT 1 */
        //create image dropdown selection
        var uploadImageSelectionColHeader = document.createElement('select')
        uploadImageSelectionColHeader.setAttribute('id', `upload-${uploadNumber}-imageOptionsCol`)
        uploadImageSelectionColHeader.setAttribute('style', `max-width:150px; text-align: left;`)
       
        try {
            for (var x = 0; x < uploadFiles.images.length; x++) {
                var rowImg = document.createElement('option')
                rowImg.setAttribute('value', x)
                rowImg.setAttribute('style', `width:150px; text-align: left;`)
                rowImg.innerHTML = `${uploadFiles.images[x].name}`
                uploadImageSelectionColHeader.appendChild(rowImg)
            }
        } catch (err) {

        }
        //add image dropdown selection to table html
       document.getElementById(`upload_${uploadNumber}_table-image-col`).appendChild(uploadImageSelectionColHeader)

        //create dataset
        let data = await createDataset(uploadFiles, uploadNumber)       

        var reorder = false;
        var searched = false;
        var origIndexes = [];
        var origSeq = [];
        var origNim = [];

        var table = $(`#upload_${uploadNumber}_table`).DataTable({
            columns: [
                { "data": "sequence" },
                { "data": "#" },
                { "data": "selectAll" },
                { "data": "audio" },
                //{ "data": "format" },
                { "data": "length" },
                { "data": "imgSelection" },
                { "data": "outputFormat" },
                //{ "data": "outputLocation" },
            ],
            columnDefs: [
                { //invisible sequence num
                    searchable: false,
                    orderable: false,
                    visible: false,
                    targets: 0,
                },
                { //visible sequence num
                    searchable: false,
                    orderable: false,
                    targets: 1,
                    
                },
                {//select all checkbox
                    "className": 'selectall-checkbox',
                    "className": "text-center",
                    searchable: false,
                    orderable: false,
                    targets: 2,
                },
                {//audio filename 
                    targets: 3,
                    type: "natural"
                },
                /*
                {//audio format
                    targets: 4,
                    type: "string"
                },
                */
                { //audio file length
                    targets: 4,
                    type: "string"
                },
                { //image selection
                    targets: 5,
                    type: "string",
                    orderable: false,
                    className: 'text-left'
                },
                { //video output format
                    targets: 6,
                    type: "string",
                    orderable: false
                }
            ],
            "language": {
                "emptyTable": "No files in this upload"
              },
            dom: 'rt',
            rowReorder: {
                dataSrc: 'sequence',
            },
            select: {
                style: 'multi',
                selector: 'td:nth-child(2)'
            },
        });

        var count = 1;
        data.forEach(function (i) {
            table.row.add({
                "sequence": i.itemId,
                "#": count,
                "selectAll": '<input type="checkbox">',
                "audio": i.audio,
                //"format": 'adasd',//i.format,
                "length": i.length,
                "imgSelection": i.imgSelection,
                "outputFormat": i.vidFormatSelection,
                //"outputLocation": "temp output location",
            }).node().id = 'rowBrowseId' + i.sampleItemId;
            count++;
        });
        table.draw();

        //image selection changed
        $(`#upload-${uploadNumber}-imageOptionsCol`).change(function(event) {
            console.log(`upload-1-imageOptionsCol clicked`)
            let indexValueImgChoice = $(`#upload-${uploadNumber}-imageOptionsCol`).val()
            console.log('set all to ', indexValueImgChoice)
            table.rows().eq(0).each( function ( index ) {
                console.log('index = ', index)
                document.getElementById(`upload_${uploadNumber}_table-image-row_${index}`).selectedIndex = `${indexValueImgChoice}`
            } );
        });

        //select all checkbox clicked
        $(`#upload_${uploadNumber}_table-selectAll`).on('click', function (event) {
            let checkedStatus = document.getElementById(`upload_${uploadNumber}_table-selectAll`).checked
            if(checkedStatus == true){
                //box is going from unchecked to checked, so select all
                var rows = table.rows().nodes();
                $('input[type="checkbox"]', rows).prop('checked', true);
                table.$("tr").addClass('selected')
            }else{
                //unselect all
                var rows = table.rows().nodes();
                $('input[type="checkbox"]', rows).prop('checked', false);
                table.$("tr").removeClass('selected')
                
                
            }
            
            updateFullAlbumDisplayInfo(table, uploadNumber)
            
        });

        //row clicked
        $(`#upload_${uploadNumber}_table tbody`).on( 'click', 'tr', function () {        
            //determine whether or not to select/deselect & check/uncheck row
            var count = $(`#upload_${uploadNumber}_table`).find('input[type=checkbox]:checked').length;
            document.getElementById(`upload_${uploadNumber}_numChecked`).innerText = count
            document.getElementById(`upload_${uploadNumber}_numCheckedFullAlbum`).innerText = count
            
            var isSelected = $(this).hasClass('selected')
            $(this).toggleClass('selected').find(':checkbox').prop('checked', !isSelected);

            updateFullAlbumDisplayInfo(table, uploadNumber)
   
            
            
        });
        

        //video output format selection changed
        $(`#upload_${uploadNumber}_table-vidFormat-col`).change(function(event) {
            console.log(`#upload_${uploadNumber}_table-vidFormat-col clicked`)
            let indexValueImgChoice = $(`#upload_${uploadNumber}_table-vidFormat-col`).val()
            var rowNum = table.data().count();
            console.log('rowNum = ', rowNum)
            //for(var x = 0; x < rowNum; x++){
            //    document.getElementById(`upload_${uploadNumber}_table-vidFormat-row_${x}`).selectedIndex = `${indexValueImgChoice}`
            //}
            //table.rows().eq(0).each( function ( index ) {
                //var elem = document.getElementById(`upload_${uploadNumber}_table-vidFormat-row_${index}`)
                //console.log(`elem = `, elem)
                //console.log(`elem.selectedIndex = `, elem.selectedIndex)
                //document.getElementById(`upload_${uploadNumber}_table-vidFormat-row_${index}`).selectedIndex = `${indexValueImgChoice}`
                //elem.selectedIndex = 1
                //setAllVidFormats(uploadNum, indexValueImgChoice)
            //} );
            //document.getElementById(`upload_1_table-vidFormat-row_2`).selectedIndex = 1

            setAllVidFormats(uploadNumber, rowNum, indexValueImgChoice)
        });

        

        //video output location button clicked
        
        $(`#upload_${uploadNumber}_table-vidLocationButton`).on('click',function(event) {
            $(`#upload_${uploadNumber}_table-vidLocation`).click()
        })

        $(`#upload_${uploadNumber}_table-vidLocation`).change(function(event) {
            var filePath = document.getElementById(`upload_${uploadNumber}_table-vidLocation`).files[0].path
            console.log('filePath = ', filePath)
            console.log('process.platform  =', process.platform)
            if((process.platform).includes('win')){
                var parseChar = "\\"
            }
            var path = (filePath.substring(0, filePath.lastIndexOf(parseChar)))+parseChar
            console.log('path = ', path)
            document.getElementById(`upload_${uploadNumber}_table-vidLocationButton`).innerText = path

        })

        

        

        table.on('order.dt', function (e, diff, edit) {
            console.log('order', reorder, searched);

            //don't adjust "#" column if already changed by rowReorder or search events
            if (!reorder && !searched) {
                console.log('order.dt - resetting order');
                i = 1;
                //assign "#" values in row order
                table.rows({ search: 'applied', order: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                    var data = this.data();
                    data['#'] = i;
                    i++;
                    this.data(data);
                });
            }
            //reset booleans
            reorder = false;
            searched = false;

        });
        table.on('row-reorder', function (e, details, edit) {
            console.log('row-reorder');
            //get original row indexes and original sequence (rowReorder indexes)
            origIndexes = table.rows().indexes().toArray();
            origSeq = table.rows().data().pluck('sequence').toArray();
        });

        table.on('search.dt', function () {
            console.log('search', reorder);
            //skip if reorder changed the "#" column order
            if (!reorder) {
                console.log('search.dt - resetting order');
                i = 1;
                //assign "#" values in row order
                table.rows({ search: 'applied', order: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                    var data = this.data();
                    data['#'] = i;
                    i++;
                    this.data(data);
                });
            }
            //don't change "#" order in the order event
            searched = true;
        });

        table.on('row-reordered', function (e, details, edit) {
            console.log('row-reorderd');
            //get current row indexes and sequence (rowReorder indexes)
            var indexes = table.rows().indexes().toArray();
            //console.log('org indexes', origIndexes);
            //console.log('new indexes', indexes);
            var seq = table.rows().data().pluck('sequence').toArray();
            //console.log('org seq', origSeq);
            //console.log('new seq', seq);
            i = 1;

            for (var r = 0; r < indexes.length; r++) {
                //get row data
                var data = table.row(indexes[r]).data();
                //console.log('looking for',seq[r]);
                //get new sequence 
                //origSeq   [1, 3, 4, 2]
                //seq       [3, 4, 1, 2]
                //indexes   [0, 2, 3, 1]
                //use the new sequence number to find index in origSeq
                //the (index + 1) is the original row "#" to assign to the current row
                newSeq = origSeq.indexOf(seq[r]);
                //console.log('found new seq',newSeq);

                //assign the new "#" to the current row
                data['#'] = newSeq + 1;
                table.row(indexes[r]).data(data);

            }
            //re-sort the table by the "#" column
            table.order([1, 'asc']);

            //don't adjust the "#" column in the search and order events
            reorder = true;
        });

        
        //row-reorder
        table.on('row-reorder', function (e, diff, edit) {
            var result = 'Reorder started on row: ' + edit.triggerRow.data()[1] + '<br>';

            for (var i = 0, ien = diff.length; i < ien; i++) {
                var rowData = table.row(diff[i].node).data();

                result += rowData[1] + ' updated to be in position ' +
                    diff[i].newData + ' (was ' + diff[i].oldData + ')<br>';
            }

            console.log(result);
        });


        resolve()
    })
}

async function updateFullAlbumDisplayInfo(table, uploadNumber){
    var selectedRows = table.rows( '.selected' ).data()
    console.log('selectedRows = ', selectedRows)

    var count = $(`#upload_${uploadNumber}_table`).find('input[type=checkbox]:checked').length;
            document.getElementById(`upload_${uploadNumber}_numChecked`).innerText = count
            document.getElementById(`upload_${uploadNumber}_numCheckedFullAlbum`).innerText = count
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
            audioLength = Math.round((audioLength / 60) * 100) / 100
            console.log('audioLength = ', audioLength)
            //    return(duration);
            //});
            fileList.audio.push({ 'path': f.path, 'type': audioFormat, 'name': f.name, 'length': audioLength })
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
    return new Promise(function (resolve) {
        var audio = new Audio();
        $(audio).on("loadedmetadata", function () {
            resolve(audio.duration);
        });
        audio.src = src;
    });
}

async function ffmpegSingleRender(audioPath, imgPath, videoPath){
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
    /*
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
    */
    console.log("end of ffmpeg-test")
}

//datatables natural sort plugin code below:

(function() {
 
    /*
     * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
     * Author: Jim Palmer (based on chunking idea from Dave Koelle)
     * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
     * See: http://js-naturalsort.googlecode.com/svn/trunk/naturalSort.js
     */
    function naturalSort (a, b, html) {
        var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?%?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            htmre = /(<([^>]+)>)/ig,
            // convert all to strings and trim()
            x = a.toString().replace(sre, '') || '',
            y = b.toString().replace(sre, '') || '';
            // remove html from strings if desired
            if (!html) {
                x = x.replace(htmre, '');
                y = y.replace(htmre, '');
            }
            // chunk/tokenize
        var xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null;
     
        // first try and sort Hex codes or Dates
        if (yD) {
            if ( xD < yD ) {
                return -1;
            }
            else if ( xD > yD ) {
                return 1;
            }
        }
     
        // natural sorting through split numeric strings and default strings
        for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
            // find floats not starting with '0', string or 0 if not defined (Clint Priest)
            var oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc], 10) || xN[cLoc] || 0;
            var oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc], 10) || yN[cLoc] || 0;
            // handle numeric vs string comparison - number < string - (Kyle Adams)
            if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
                return (isNaN(oFxNcL)) ? 1 : -1;
            }
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            else if (typeof oFxNcL !== typeof oFyNcL) {
                oFxNcL += '';
                oFyNcL += '';
            }
            if (oFxNcL < oFyNcL) {
                return -1;
            }
            if (oFxNcL > oFyNcL) {
                return 1;
            }
        }
        return 0;
    }
     
    jQuery.extend( jQuery.fn.dataTableExt.oSort, {
        "natural-asc": function ( a, b ) {
            return naturalSort(a,b,true);
        },
     
        "natural-desc": function ( a, b ) {
            return naturalSort(a,b,true) * -1;
        },
     
        "natural-nohtml-asc": function( a, b ) {
            return naturalSort(a,b,false);
        },
     
        "natural-nohtml-desc": function( a, b ) {
            return naturalSort(a,b,false) * -1;
        },
     
        "natural-ci-asc": function( a, b ) {
            a = a.toString().toLowerCase();
            b = b.toString().toLowerCase();
     
            return naturalSort(a,b,true);
        },
     
        "natural-ci-desc": function( a, b ) {
            a = a.toString().toLowerCase();
            b = b.toString().toLowerCase();
     
            return naturalSort(a,b,true) * -1;
        }
    } );
     
    }());