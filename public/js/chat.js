console.log(currUserId);
const socket=io('/stayChat',{
    auth:{
        token: currUserId,
        Htoken: Host_Id,
    }
});


console.log(hostId);




socket.on('getOnlineUser',(data)=>{
    $('#'+data+'-status').text('Online');

});


socket.on('getOfflineUser',(data)=>{
    $('#'+data+'-status').text('Offline');

});
