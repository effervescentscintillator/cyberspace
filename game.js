export function turn(THREE, scene, dynamicObjects, camera, jolt, physicsSystem, input, players, init, bodyInterface, i, deltaTime){
  if(input.init){
  }

  if(input.clickedLeft){
    if(players[i].projectiles.length > 0){
      let id = players[i].projectiles[0].threeObject.userData.body.GetID();
      bodyInterface.RemoveBody(id);
      bodyInterface.DestroyBody(id);
      delete players[i].projectiles[0].threeObject.userData.body;
      scene.remove(players[i].projectiles[0].threeObject);
    }

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
  }

  if(input.clickedRight){
  }

  if(players[i].projectiles.length > 0){
    for (var n = 0; n < input.contacts.length; n++) {
      if(input.contacts[n].body2.GetID().GetIndex() == players[i].projectiles[0].bodyID.GetIndex()){
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
