class LoginRequestDTO{
    constructor(body){
        this.email = body.email;
        this.password = body.password;
    }
}

module.exports = LoginRequestDTO