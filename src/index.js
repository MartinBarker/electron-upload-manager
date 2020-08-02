/* 
run this code when the page first loads 
*/
updateUploadListDisplay()

/*
Event Listeners
*/
$(document).keypress(function(e) {
    if ($("#uploadModal").hasClass('show')) {
      console.log("Enter is pressed");
      document.getElementById('createUploadButton').click()
    }
  });

/*
Functions
*/
async function addNewUpload(title, files){
    //show modal
    //var modal = document.getElementById("uploadModal");
    //modal.setAttribute('aria-model', 'true')
    //modal.setAttribute('style', 'display: block; padding-right: 17px;')
    //modal.setAttribute('class', 'modal show')
    
    //get uploadNumber
    let uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    let uploadNumber = 1
    if(uploadList != null){
        uploadNumber = (Object.keys(uploadList).length)+1;
    }
    let uploadKey = `upload-${uploadNumber}`
    let uploadObj = {'files':files}
    //console.log('addNewUpload: ', uploadKey, ' - ', uploadObj)
    await addToUploadList(uploadKey, uploadObj)
    updateUploadListDisplay()
    //await createNewUploadCard(uploadObj, uploadNumber)
}

async function removeUploadFromUploadList(uploadId){
    console.log("delete ", uploadId)
    let uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    console.log("delte(0 before = uploadList = ", uploadList)
    delete uploadList[uploadId]
    console.log("REM(0 after = ", uploadList)
    await localStorage.setItem('uploadList', JSON.stringify(uploadList))

}

async function deleteUpload(uploadId){
    console.log("deleteUpload() uploadId = ", uploadId)
    //when delete button is clicked
    document.getElementById("deleteUploadConfirm").addEventListener("click", confirmDelete);

    async function confirmDelete() {
        console.log('confirm delte uploadId = ', uploadId)
        //remove card display
        document.getElementById(uploadId).remove()
        //remove card from db
        await removeUploadFromUploadList(uploadId)
    }

}


async function getLocalStorage(input){
    var item = await JSON.parse(localStorage.getItem(input))
    console.log(item)
}

async function createNewUploadCard(uploadObj, uploadNumber){
    return new Promise(async function (resolve, reject) {
        $( "#uploadList" ).append( `
            
            <div id="upload-${uploadNumber}" class="card ml-5 mr-5 mt-5 uploadCard ">
                <!-- Header -->
                <div class="card-header expandable">
                    <a data-toggle="collapse" href="#collapse-example-${uploadNumber}" aria-expanded="true" aria-controls="collapse-example-${uploadNumber}" id="heading-example-${uploadNumber}" >
                        <i class="rotate fa fa-chevron-down "></i>
                        DEBUG Upload Title
                    </a>

                    <a style='cursor: pointer;'  data-toggle="modal" data-target="#deleteModal" onClick='deleteUpload("upload-${uploadNumber}")' > 
                        <i style='color:red' class="fa fa-close pull-right"></i>
                    </a>
                </div>


                <!-- Body -->
                <div id="collapse-example-${uploadNumber}" class="collapse show" aria-labelledby="heading-example-${uploadNumber}">
                    <div class="card-body">
                        temp input stuff cool quid
                    </div>
                </div>
            </div>
            
        ` );
        resolve()
    })
}

async function updateUploadListDisplay(){
    let uploadListDisplay = document.getElementById('uploadList')
    
    //get uploadList from localstorage
    var uploadList = await JSON.parse(localStorage.getItem('uploadList'))
    
    console.log('~ updateUploadListDisplay() uploadList = ', uploadList)
    
    //if uploadList exists
    if(uploadList != null){
        
        //for each object in uploadList
        for (const [key, value] of Object.entries(uploadList)) {
            uploadNumber = key.split('-')[1]
            //if div with id = upload-${uploadNumber} does not exist:
            var uploadObj = document.getElementById(`upload-${uploadNumber}`)
            console.log("~ updateUploadListDisplay() uploadObj = ", uploadObj)
            if(uploadObj == null){
                console.log('~ updateUploadListDisplay() add to display: ', key, ', ', value)
                await createNewUploadCard('info', uploadNumber)
            }else{
                console.log('~ updateUploadListDisplay() dont add already visible: ', key, ', ', value)
            }
            
            

            
            //console.log('updateUploadListDisplay() newUploadCard = ', newUploadCard)
            
            //uploadListDisplay.appendChild(newUploadCard);
            //console.log(`    ${key}: ${value}`);
            //uploadListDisplay.innerHTML = uploadListDisplay.innerHTML + `[${key}]-${JSON.stringify(value)}]<br><hr>`
          }
    }else{
        console.log('~ updateUploadListDisplay() uploadList = null')
    }
    
}

async function addToUploadList(uploadKey, uploadValue){
    return new Promise(async function (resolve, reject) {

        //console.log("addToUploadList()")
        //get uploadList from localstorage
        var uploadList = await JSON.parse(localStorage.getItem('uploadList'))
        //console.log("addToUploadList() init uploadList = ", uploadList)

        //if uploadList does not exists
        if(uploadList == null){
            //create new uploadList object
            let newUploadListObj = {}
            //set uploadList in localstorage
            await localStorage.setItem('uploadList', JSON.stringify(newUploadListObj))
            uploadList = await JSON.parse(localStorage.getItem('uploadList'))
        }

        //if uploadKey does not exist
        if(uploadList[uploadKey] == null){
            //console.log(`${uploadKey} does not exist in uploadList, so create new`)
            uploadList[uploadKey] = uploadValue
        }else{
            //console.log(`${uploadKey} does exist in uploadList, so update pre-existing obj`)
        }

        //console.log("addToUploadList() done uploadList = ", uploadList)
        await localStorage.setItem('uploadList', JSON.stringify(uploadList))
        resolve('')
    })
}

async function fileDropEvent(event){
    event.preventDefault();
    event.stopPropagation();

    //sort all files into audio / images 
    var fileList = {'images':[], 'audio':{}}
    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path 
        if((f.type).includes('image')){
            //fileList.images.push({'path':f.path, 'type':f.type, 'name':f.name})
            fileList.images.push({'path':f.path, 'type':f.type, 'name':f.name})

        }else if((f.type).includes('audio')){
            var splitType = (f.type).split('/')
            var audioFormat = splitType[1]
            //if audioformat is not in object
            if(!fileList.audio[audioFormat]){
                fileList.audio[audioFormat] = []
            }
            fileList.audio[audioFormat].push({'path':f.path, 'type':f.type, 'name':f.name})
        }
    }
    console.log('files: ', fileList)
    addNewUpload(fileList)
    
}

//add event listeners for every element on page with 'uploadCard' class
var newUploadBox = document.getElementById('newUploadBox')
newUploadBox.addEventListener('drop', () => fileDropEvent(event))

newUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

newUploadBox.addEventListener('dragenter', (event) => {
    console.log('File is in the Drop Space');
    //newUploadBox.style.backgroundColor = '#cccccc';
});

newUploadBox.addEventListener('dragleave', (event) => {
    console.log('File has left the Drop Space');
    //newUploadBox.style.backgroundColor = '#ffffff'
}); 

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
