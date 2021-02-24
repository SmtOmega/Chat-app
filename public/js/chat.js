const socket = io()

const messageForm = document.querySelector('#message-form')
const messageFormButton = messageForm.querySelector('button')
const messageFormInput = messageForm.querySelector('input')
const shareLocation = document.querySelector('#share-location')
const $message = document.querySelector('#message')



//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemp = document.querySelector('#share-location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// socket.on('updatedCount', (count) => {
//     console.log('count has been updated!', count)
// })


// Options

 const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// document.querySelector('#inc').addEventListener('click', () => {
//     console.log('clicked')

//     socket.emit('increment')
// })

const autoScroll = () => {
    const $newMessage = $message.lastElementChild


    //height of new messages
    const $newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt($newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    console.log(newMessageMargin)

    // visible height

    const visibleHeight = $message.offsetHeight

    //height of meesage container

    const containerHeight = $message.scrollHeight

    //how far is the scrolling

    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }
}


socket.on('welcomeMessage', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt : moment(message.createdAt).format('h:mm')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemp, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')

    const sendMessage = e.target.elements.message.value

    socket.emit('chatMessage', sendMessage, (error) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered')
    })
})

shareLocation.addEventListener('click', (e) =>{
    e.preventDefault()
    shareLocation.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation  is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude
        const location = {lat, long}

        socket.emit('sendLocation', location, ()=>{
            console.log('location shared')
            shareLocation.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})