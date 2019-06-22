const users = [];

// add users, remove users, get users, get users in room

const addUsers = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "UserName and Room are Required!!"
    };
  }

  //check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "username is in use!"
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove user function

const removeUser = id => {
  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};

//get user function
const getUser = id => {
  const user = users.find(user => {
    return user.id === id;
  });
  if (!user) {
    return undefined;
  }
  return user;
};

//getUsersInRoom

const getUsersInRoom = room => {
  const usersInRoom = users.filter(user => {
    return user.room === room;
  });
  if (usersInRoom) return usersInRoom;
};

module.exports = {
  addUsers,
  removeUser,
  getUsersInRoom,
  getUser
};
