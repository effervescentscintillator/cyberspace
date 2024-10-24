export class DedicatedServer {
  constructor(io){

    import initJolt from '/jolt-physics.wasm-compat.js';
    import { Ent } from '/ent.js';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    const loader = new GLTFLoader();
    this.list = [];
    var scene = new THREE.Scene();

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

    function initGraphics() {

    }

    function initPhysics() {

    }

    function initExample(Jolt, updateFunction) {
      initGraphics();
      initPhysics();
      //setImmediate(function() {})
    }

    initJolt().then(function (Jolt) {});

      loader.load(
        'map.glb',
        // called when the resource is loaded
        function ( gltf ) {
          initExample(Jolt, null);
          scene.add( gltf.scene );

          for (var m = 0; m < gltf.scene.children.length; m++) {

              if(gltf.scene.children[m].name.slice(-4) === '-col'){

                if(!gltf.scene.children[m].children.length > 0){
                  gltf.scene.children[m].children[0] = gltf.scene.children[m];
                }

                for (var w = 0; w < gltf.scene.children[m].children.length; w++) {
                      let vertex = gltf.scene.children[m].children[w].geometry.attributes.position;
                      let index = gltf.scene.children[m].children[w].geometry.index;
                      let j, i, ref;

                      let triangles = new Jolt.TriangleList();

                      for (i = j = 0, ref = index.count /  3; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
                        triangles.push_back(new Jolt.Triangle(
                        new Jolt.Vec3(vertex.getX(index.getX(i*3)), vertex.getY(index.getX(i*3)), vertex.getZ(index.getX(i*3))),
                        new Jolt.Vec3(vertex.getX(index.getY(i*3)), vertex.getY(index.getY(i*3)), vertex.getZ(index.getY(i*3))),
                        new Jolt.Vec3(vertex.getX(index.getZ(i*3)), vertex.getY(index.getZ(i*3)), vertex.getZ(index.getZ(i*3)))
                      ));
                  }

                  let shape = new Jolt.MeshShapeSettings(triangles).Create().Get();
                  Jolt.destroy(triangles);

                  // Create body
                  let creationSettings = new Jolt.BodyCreationSettings(shape, new Jolt.Vec3(0, 0, 0), new Jolt.Quat(0, 0, 0, 1), Jolt.EMotionType_Static, LAYER_NON_MOVING);
                  let body = bodyInterface.CreateBody(creationSettings);
                  Jolt.destroy(creationSettings);
                  bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);
                }
              }

          }

          setup();
        },
        // called while loading is progressing
        function ( xhr ) {
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened: ' + error );
        }
      )
    
      var setup = function(){};
  }
}