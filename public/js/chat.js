const socket=io()

//ELEMENTS
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//TEMPLATES
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML


//OPTIONS
const {username, room}=Qs.parse(location.search, {ignoreQueryPrefix: true})

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')

//     socket.emit('increment')
// })

const autoscroll=() => {

     //New message element
     const $newMessage=$messages.lastElementChild
    
     //Height of the new message
     const newMessageStyles=getComputedStyle($newMessage)
     const newMessageMargin=parseInt(newMessageStyles.marginBottom)
     const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

     //Visible height
     const visibleHeight=$messages.offsetHeight

     //Height of messages container
     const containerHeight=$messages.scrollHeight

     //How far have I scrolled ?
     const scrollOffset=$messages.scrollTop + visibleHeight

     if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
     }


}

socket.on('message', (msg) => {
    console.log(msg)
    const html=Mustache.render(messageTemplate, {
        username:msg.username,
        msg:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})


socket.on('locationMessage', (message) => {
    console.log(message)
    const html=Mustache.render(locationMessageTemplate, {
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})


socket.on('roomData' , ({room, users}) => {
    const html=Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML=html
})



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    // const message=document.querySelector('#message').value

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message, (error) =>{
         $messageFormButton.removeAttribute('disabled')
         $messageFormInput.value=''
         $messageFormInput.focus()


        if(error){
            return console.log(error)
        }

        console.log('Message delivered!')
    })



    // console.log("User sent a message: ", usermsg)
})


$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
  return alert('Geolocation is not supported by the browser')      
    }

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)

        $sendLocationButton.setAttribute('disabled','disabled')

        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
})


socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href='/'
    }
})  