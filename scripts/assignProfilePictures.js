const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectToDatabase = require('../config/dbConfig');  
const User = require('../models/User'); 

dotenv.config();

connectToDatabase();

function generateRandomProfilePic() {
  return `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;
}

async function assignProfilePictures() {
  try {
    const users = await User.find();

    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    for (const user of users) {
      const randomProfilePic = generateRandomProfilePic();

      user.profilePic = randomProfilePic;
      await user.save();

      console.log(`Updated profile picture for ${user.firstName} ${user.surname}`);
    }

    console.log('All users updated successfully.');
  } catch (err) {
    console.error('Error updating users:', err);
  } finally {
    mongoose.disconnect();
  }
}

assignProfilePictures();
