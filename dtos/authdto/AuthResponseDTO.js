class UserResponseDTO {
    constructor(user){
        this.id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.isAdmin = user.isAdmin;
        
    }
}

module.exports = UserResponseDTO;