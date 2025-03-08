import mongoose from "mongoose";
import userModel from "./userModel";

const mockingoose = require('mockingoose')

beforeEach(() => {
    mockingoose.resetAll();
})

const mockUser1 = {
    name: "mockuser",
    email: "email@123.com",
    password: "password123",
    phone: "91234567",
    address: "address",
    answer: "answer1",
}
const updatedMockUser1 = {
    name: "updatedMockuser",
    email: "email@123.com",
    password: "password123",
    phone: "91234567",
    address: "address",
    answer: "answer1",
}

const mockUser2 = {
    name: "mockuser2",
    email: "email@321.com",
    password: "password321",
    phone: "97654321",
    address: "address",
    answer: "answer2",
}

const users = [ mockUser1, mockUser2];


const mockUserWithRole = {
    name: "mockuser",
    email: "email@123.com",
    password: "password123",
    phone: "91234567",
    address: "address",
    answer: "answer1",
    role: 0,
}

describe("User Model", () => {
    it('should create a new user with default role 0', async () => {

        mockingoose(userModel).toReturn(mockUser1, "save");

        const user = new userModel(mockUser1);
        const savedUser = await user.save();

        expect(savedUser.toObject().role).toBe(0);
    });

    it('should create a new user', async () => {

        mockingoose(userModel).toReturn(mockUser1, "save");
        const user = new userModel(mockUser1);
        const savedUser = await user.save();
        
        expect(savedUser.toObject()).toMatchObject(mockUserWithRole)
    });

    it('should update a user', async () => {
        mockingoose(userModel).toReturn(mockUser1, "save");
        const user = new userModel(mockUser1);
        const savedUser = await user.save();

        savedUser.name = updatedMockUser1.name;

        mockingoose(userModel).toReturn(savedUser, "findOneAndUpdate");

        const updatedUser = await userModel.findOneAndUpdate(savedUser._id, updatedMockUser1.name);

        expect(updatedUser.toObject()).toMatchObject(updatedMockUser1)
    })

    it('should retrieve users from the database', async () => {
        mockingoose(userModel).toReturn(users, "find");
        const fetchedUsers = await userModel.find();
        const fetchedUsersObjects = fetchedUsers.map(user => user.toObject());

        expect(fetchedUsersObjects).toMatchObject(users);
    })
    
    it('should delete a user', async ()=> {
        const mockUserWithId = { ...mockUserWithRole, _id: new mongoose.Types.ObjectId() };

        mockingoose(userModel).toReturn(mockUserWithId, "findOneAndDelete");

        const deletedUser = await userModel.findByIdAndDelete(mockUserWithId._id);

        expect(deletedUser.toObject()).toMatchObject(mockUserWithId)
    })
    }
)