class RegisterRequestDTO {
    constructor(body){
        this.name = body.name;
        this.email = body.email;
        this.password = body.password;
    }
}

module.exports = RegisterRequestDTO
    