export class DedicatedServer {
  constructor(io){

    this.list = [];

    io.listen(3000) // default port is 9208

    io.onConnection(channel => {
      this.list.push(channel);
      io.room(channel.roomId).emit('chat message', {a: this.list.length});
      channel.emit('chat message', 'aaaaaaaaa');
      //for (var x = 0; x < list.length; x++){
        //io.room(channel.roomId).emit('chat message', list[x].userData.name);
      //}


      channel.onDisconnect(() => {
        console.log(`${channel.id} got disconnected`);
        io.room(channel.roomId).emit('chat message', channel.id + ' got disconnected');
        if (this.list[this.list.indexOf(channel)]){
          this.list.splice(this.list.indexOf(channel),1);
        }
      })

      channel.on('chat message', data => {
        console.log(`got ${data} from "chat message"`)
        // emit the "chat message" data to all channels in the same room
        io.room(channel.roomId).emit('chat message', data)
      })
      channel.on('name', data => {
        console.log(`got ${data} from "chat message"`)
        // emit the "chat message" data to all channels in the same room
        //for (var x = 0; x < list.length && x != list.indexOf(channel); x++){
          //while (list[x][userData]['name'].toLowerCase() === data.toLowerCase()){
            //data = data + Math.floor(Math.random() * (9 - 1 + 1) + 1);
          //};
        //};
        channel.userData = {name: data};
        io.room(channel.roomId).emit('chat message', channel.userData.name);
      })
    })

    this.onConnection = function(io, channel) {
      
    }
    
  }
}