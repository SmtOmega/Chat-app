const users = []


// add user function

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data

    if(!username || !room){
        return {
            error: 'username and password are required'
        }
    }

    // checking for existing user

    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    })
    if(existingUser){
        return {
            error: 'username is already in use'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

// removing a user

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

// fetching user
const getUser = (id) => {
    const user = users.find(user => user.id === id)
    if(!user){
        return undefined
    }
    return user
}

// fetching users in a room

const getUserInRoom = (room) => {
    const filterUser = users.filter(user => user.room === room)
    if(!filterUser){
        return []
    }
    return filterUser
}

addUser({
    id: 1,
    username: 'Mike',
    room: 'lagos'
})
addUser({
    id: 2,
    username: 'Funke',
    room: 'lagos'
})

addUser({
    id: 3,
    username: 'Mike',
    room: 'IB'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}