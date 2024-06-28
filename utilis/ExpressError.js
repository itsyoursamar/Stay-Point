class ExpressError extends Error{ //error class se properties inherit krli ExpressError me
    constructor(statusCode,message){
        super();
            this.statusCode=statusCode;
            this.message=message;
    }
}
module.exports =ExpressError;