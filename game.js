export function turn(THREE, scene, dynamicObjects, camera, jolt, physicsSystem, input, players, init, bodyInterface, i, deltaTime){
  if(input.init){
    console.log('game init');
    /*
    const contactListener = new Jolt.ContactListenerJS();

    contactListener.OnContactValidate = (body1, body2, baseOffset, collideShapeResult) => {
          console.log('aaab');
          body1 = Jolt.wrapPointer(body1, Jolt.Body);
          body2 = Jolt.wrapPointer(body2, Jolt.Body);
          collideShapeResult = Jolt.wrapPointer(collideShapeResult, Jolt.CollideShapeResult);
          return Jolt.ValidateResult_AcceptAllContactsForThisBodyPair;
    };
    contactListener.OnContactAdded = (body1, body2, manifold, settings) => {
                console.log('aaa2c');

          body1 = Jolt.wrapPointer(body1, Jolt.Body);
          body2 = Jolt.wrapPointer(body2, Jolt.Body);
          manifold = Jolt.wrapPointer(manifold, Jolt.ContactManifold);
          settings = Jolt.wrapPointer(settings, Jolt.ContactSettings);
          console.log(body1.GetID().GetIndex() + ' ' + body2.GetID().GetIndex() + ' ' + manifold.mWorldSpaceNormal.ToString());

          // Override the restitution to 0.5
          settings.mCombinedRestitution = 0.5;
    };
    contactListener.OnContactPersisted = (body1, body2, manifold, settings) => {
          body1 = Jolt.wrapPointer(body1, Jolt.Body);
          body2 = Jolt.wrapPointer(body2, Jolt.Body);
          manifold = Jolt.wrapPointer(manifold, Jolt.ContactManifold);
          settings = Jolt.wrapPointer(settings, Jolt.ContactSettings);
          //collisionLog.value += 'OnContactPersisted ' + body1.GetID().GetIndex() + ' ' + body2.GetID().GetIndex() + ' ' + manifold.mWorldSpaceNormal.ToString() + '\n';

          // Override the restitution to 0.5
          settings.mCombinedRestitution = 0.5;
        };
    contactListener.OnContactRemoved = (subShapePair) => {
          subShapePair = Jolt.wrapPointer(subShapePair, Jolt.SubShapeIDPair);
          //collisionLog.value += 'OnContactRemoved ' + subShapePair.GetBody1ID().GetIndex() + ' ' + subShapePair.GetBody2ID().GetIndex() + '\n';
    };
    physicsSystem.SetContactListener(contactListener);*/

  }

  if(input.clickedLeft){

    if(players[i].projectiles.length > 0){
      let id = players[i].projectiles[0].threeObject.userData.body.GetID();
      bodyInterface.RemoveBody(id);
      bodyInterface.DestroyBody(id);
      delete players[i].projectiles[0].threeObject.userData.body;
      scene.remove(players[i].projectiles[0].threeObject);
    }

    console.log('left');

    let shape = new Jolt.BoxShape(new Jolt.Vec3(.25, .25, .25), 0.05, null);

    let creationSettings = new Jolt.BodyCreationSettings(
      shape,
      new Jolt.Vec3(camera.position.x, camera.position.y, camera.position.z),
      Jolt.Quat.prototype.sIdentity(), 
      Jolt.EMotionType_Kinematic, 
      1
    );
    let body = bodyInterface.CreateBody(creationSettings);
    Jolt.destroy(creationSettings);

    body.SetIsSensor(true);
    body.SetCollideKinematicVsNonDynamic(true);
    bodyInterface.AddBody(body.GetID(), Jolt.EActivation_Activate);

    players[i].projectiles[0] = {};
    let threeObject = getThreeObjectForBody(body, 0xffffff, THREE);
    threeObject.userData.body = body;
    players[i].projectiles[0].threeObject = threeObject;
    scene.add(players[i].projectiles[0].threeObject);

    players[i].projectiles[0].bodyID = body.GetID();
    players[i].projectiles[0].position = bodyInterface.GetPosition(players[i].projectiles[0].bodyID);
    players[i].projectiles[0].active = true;

    players[i].material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    players[i].geometrytest = new THREE.BoxGeometry( .125, .125, .125 );
    players[i].cubec = new THREE.Mesh( players[i].geometrytest, players[i].material );

    scene.add(players[i].cubec);

    players[i].projectiles[0].threeObject.setRotationFromQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()));

    let threeQuat = players[i].projectiles[0].threeObject.quaternion;
    let quat = new Jolt.Quat(
      threeQuat._x,
      threeQuat._y,
      threeQuat._z,
      threeQuat._w
    );

    bodyInterface.SetRotation(
      players[i].projectiles[0].bodyID,
      quat,
      Jolt.EActivation_DontActivate
    );

    //cy.createBox(new Jolt.Vec3(-45, 1, 0), Jolt.Quat.prototype.sIdentity(), new Jolt.Vec3(0.5, 2, 45), Jolt.EMotionType_Static, cy.LAYER_NON_MOVING);
    /*
    if(players[i].proj){
      scene.remove(players[i].cubec);
      world.removeCollider(players[i].projCollider);
      world.removeCharacterController(players[i].projController);
    }

    players[i].material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    players[i].geometrytest = new THREE.BoxGeometry( .05, .05, .05 );
    players[i].cubec = new THREE.Mesh( players[i].geometrytest, players[i].material );

    scene.add(players[i].cubec);

    players[i].projColliderDesc = RAPIER.ColliderDesc.cuboid(.025, .025, .025);
    players[i].projColliderDesc.setTranslation(
      camera.position.x, camera.position.y, camera.position.z
    );

    players[i].projController = world.createCharacterController(0);

    players[i].projCollider = world.createCollider(players[i].projColliderDesc);



    players[i].cubec.setRotationFromQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()));



    players[i].cubec.position.x = camera.position.x;
    players[i].cubec.position.y = camera.position.y;
    players[i].cubec.position.z = camera.position.z;

        players[i].proj = true;

*/
}
  if(input.clickedRight){
    console.log('right');
}

if(players[i].projectiles.length > 0){
  for (var n = 0; n < input.contacts.length; n++) {
    if(input.contacts[n].body2.GetID().GetIndex() == players[i].projectiles[0].bodyID.GetIndex()){
      console.log('yay!');
      players[i].knockBack(
        players[i].projectiles[0].threeObject.position.x,
        players[i].projectiles[0].threeObject.position.y,
        players[i].projectiles[0].threeObject.position.z,
        2,
        input
      );

      players[i].projectiles[0].det = true;

    }
  }
  //threeObject.translateX(5);
  //[i].projectiles[0].threeObject.updateMatrix();
  //players[i].cubec.position.z += .01;
  //players[i].cubec.translateZ(-.01 * 100 * deltaTime);
  if(players[i].projectiles[0].det){
      let id = players[i].projectiles[0].threeObject.userData.body.GetID();
      bodyInterface.RemoveBody(id);
      bodyInterface.DestroyBody(id);
      delete players[i].projectiles[0].threeObject.userData.body;
      scene.remove(players[i].projectiles[0].threeObject);
      players[i].projectiles = [];
  } else {
  players[i].projectiles[0].threeObject.translateZ(-.25 * 100 * deltaTime);

  let joltPosition = new Jolt.RVec3(
    players[i].projectiles[0].threeObject.position.x,
    players[i].projectiles[0].threeObject.position.y,
    players[i].projectiles[0].threeObject.position.z
  );

  bodyInterface.SetPosition(
    players[i].projectiles[0].bodyID,
    joltPosition,
    Jolt.EActivation_DontActivate
  );
  players[i].projectiles[0].position = bodyInterface.GetPosition(players[i].projectiles[0].bodyID);
  }
}

/*
  if(players[i].proj){

    players[i].projTranslate = new THREE.Vector3(0,0,0);
    players[i].projLastTranslate = new THREE.Vector3(0,0,0);
    players[i].projMove = new THREE.Vector3(0,0,0);



    players[i].cubec.getWorldPosition(players[i].projLastTranslate);
    players[i].cubec.translateZ(-.05 * 100 * world.timestep);
    players[i].cubec.getWorldPosition(players[i].projTranslate);

    players[i].projMove.x =  players[i].projTranslate.x - players[i].projLastTranslate.x;
    players[i].projMove.y =  players[i].projTranslate.y - players[i].projLastTranslate.y;
    players[i].projMove.z =  players[i].projTranslate.z - players[i].projLastTranslate.z;

    console.log(players[i].projMove.x);
    console.log(players[i].projMove.y);
    console.log(players[i].projMove.z);

    
    players[i].projController.computeColliderMovement(players[i].projCollider, players[i].projMove);
    players[i].projCorrectedMovement = players[i].projController.computedMovement();


            players[i].projCorrectedMovement = players[i].cubec.getWorldPosition(players[i].projTranslate);




    players[i].cubec.position.x = players[i].projCorrectedMovement.x;
    players[i].cubec.position.y = players[i].projCorrectedMovement.y;
    players[i].cubec.position.z = players[i].projCorrectedMovement.z;

    players[i].projCollider.setTranslation(players[i].projTranslate);

    

    for (let n = 0; n < players[i].projController.numComputedCollisions() && !players[i].det; n++) {
      let collision = players[i].projController.computedCollision(n);
      console.log('n');
      console.log(collision.collider.handle);
      players[i].projCollisionHandle = collision.collider.handle;

      if(collision.collider.handle == '1e-323'){
        players[i].collidedSelf = true;
        players[i].collidedSelfToi = performance.now();
      }

      console.log(players[i].projCorrectedMovement.y - players[i].projTranslate.y);
      console.log(players[i].projCorrectedMovement.z - players[i].projTranslate.z);

      if(!players[i].det && collision.collider.handle != '1e-323' ||
        players[i].collided
         ){
              console.log('gyjhyj');

        players[i].blastProjColliderDesc = RAPIER.ColliderDesc.cuboid(20.025, 20.025, 20.025);

        players[i].blastCollider = world.createCollider(players[i].blastProjColliderDesc);
        players[i].blastCollider.setTranslation(players[i].projTranslate);        


        players[i].blastController = world.createCharacterController(0);
        players[i].blastController.computeColliderMovement(players[i].blastCollider, {x: 5.01,y: 0.01,z: 0.01});

        console.log('blast collisions' + players[i].blastController.numComputedCollisions());

        for (let m = 0; m < players[i].blastController.numComputedCollisions() && !players[i].det; m++) {
          let blastCollision = players[i].blastController.computedCollision(m);

          console.log(m + ' ' + blastCollision.collider.handle);

          if(!players[i].det && blastCollision.collider.handle == '1e-323' || 
            players[i].collidedSelf && performance.now() - players[i].collidedSelfToi < 12){
            alert('radius');
            players[i].det = true;
          }
        }

        players[i].blastController.computeColliderMovement(players[i].blastCollider, {x: 0.01,y: 0.01,z: 0.01});

        console.log('2blast collisions' + players[i].blastController.numComputedCollisions());

        for (let m = 0; m < players[i].blastController.numComputedCollisions() && !players[i].det; m++) {
          let blastCollision = players[i].blastController.computedCollision(m);

          console.log(m + ' ' + blastCollision.collider.handle);

          if(!players[i].det && blastCollision.collider.handle == '1e-323' || 
            players[i].collidedSelf && performance.now() - players[i].collidedSelfToi < 64){
            alert('2radius');
            players[i].det = true;
          }
        }


        
        players[i].det = true;
        players[i].collided = false;
        players[i].collidedSelf = false;

      }
    }
*/
/*
    if(players[i].det){
      console.log('removing proj');
      scene.remove(players[i].cubec);
      world.removeCollider(players[i].projCollider);
      world.removeCharacterController(players[i].projController);
      players[i].proj = false;
      world.removeCollider(players[i].blastCollider);
      world.removeCharacterController(players[i].blastController);
      players[i].det = false;
    }*/
}

function getThreeObjectForBody(body, color, THREE) {
  let material = new THREE.MeshPhongMaterial({ color: color });
  const wrapVec3 = (v) => new THREE.Vector3(v.GetX(), v.GetY(), v.GetZ());
  const wrapQuat = (q) => new THREE.Quaternion(q.GetX(), q.GetY(), q.GetZ(), q.GetW());

  let threeObject;
  let shape = body.GetShape();
  switch (shape.GetSubType()) {
    case Jolt.EShapeSubType_Box:
      let boxShape = Jolt.castObject(shape, Jolt.BoxShape);
      let extent = wrapVec3(boxShape.GetHalfExtent()).multiplyScalar(2);
      threeObject = new THREE.Mesh(new THREE.BoxGeometry(extent.x, extent.y, extent.z, 1, 1, 1), material);
      break;
    case Jolt.EShapeSubType_Sphere:
      let sphereShape = Jolt.castObject(shape, Jolt.SphereShape);
      threeObject = new THREE.Mesh(new THREE.SphereGeometry(sphereShape.GetRadius(), 32, 32), material);
      break;
    case Jolt.EShapeSubType_Capsule:
      let capsuleShape = Jolt.castObject(shape, Jolt.CapsuleShape);
      threeObject = new THREE.Mesh(new THREE.CapsuleGeometry(capsuleShape.GetRadius(), 2 * capsuleShape.GetHalfHeightOfCylinder(), 20, 10), material);
      break;
    case Jolt.EShapeSubType_Cylinder:
      let cylinderShape = Jolt.castObject(shape, Jolt.CylinderShape);
      threeObject = new THREE.Mesh(new THREE.CylinderGeometry(cylinderShape.GetRadius(), cylinderShape.GetRadius(), 2 * cylinderShape.GetHalfHeight(), 20, 1), material);
      break;
    default:
      threeObject = new THREE.Mesh(createMeshForShape(shape), material);
      break;
  }

  threeObject.position.copy(wrapVec3(body.GetPosition()));
  threeObject.quaternion.copy(wrapQuat(body.GetRotation()));

  return threeObject;
}

function removeFromScene(threeObject, bodyInterface, scene) {
  let id = threeObject.userData.body.GetID();
  bodyInterface.RemoveBody(id);
  bodyInterface.DestroyBody(id);
  delete threeObject.userData.body;

  scene.remove(threeObject);
}
