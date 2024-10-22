export class Ent {
  constructor(THREE){
    this.move = { x: 0.0, y: 0.0, z: 0.0 };
    this.input = { x: 0.0, y: 0.0, z: 0.0 };
    this.inputMagZ = 1;
    this.inputMagX = 1;
    this.inputMag = 1;
    this.movePosition = { x: 0, z: 0 };
    this.translation = { x: 0, y:0 , z: 0 };
    this.momentum = new THREE.Vector3(0,0,0);
    this.lateralMomentum = new THREE.Vector2(0,0);
    this.maxMomentum = 100;
    this.rotateMomentum = {};
    this.speed = 0;
    this.maxSpeed = 30;
    this.minSpeed = .1;
    this.grav = .0;
    this.agility = 0;
    this.groundAgil = .3;//1
    this.airAgil = .06; //.1 .03
    this.groundFric = 75;//350
    this.friction = this.groundFric;
    this.airFric = 0;
    this.slopeTolerance = .25;
    this.lastY = 0.0001;
    this.lookingBack = false;
    this.jumpReleased = true;
    this.jumpAmp = .00;
    this.surfMin = .38;//42
    this.surfMax = .53;
    this.surfing = false;
    this.angleOfChange = 0;
    this.isGrounded = true;
    this.angleOfDirection = 0;
    this.rotateDirection = {};
    this.mouseMovedX = 0;
    this.reorientation;
    this.correctedMovement = {};
    this.slideTimeout = 0;
    this.sliding = false;
    this.midAir = false;
    this.lat = new THREE.Vector3(0,0,0);
    this.lastLat = new THREE.Vector3(0,0,0);
    this.projectiles = [];

    this.knockBack = function(x, y, z, multiplier, input) {
      if(input.position.distanceTo(new THREE.Vector3(x,y,z)) < 8){
        if(input.hasCrouched){
          input.playerPostion = new THREE.Vector3(input.cameraPosition.x,
          input.cameraPosition.y + .5,input.cameraPosition.z);
        } else {
          input.playerPostion = new THREE.Vector3(input.cameraPosition.x,
          input.cameraPosition.y + 1,input.cameraPosition.z);
        }
        input.knockBackDistance = input.position.distanceTo(new THREE.Vector3(x,y,z));
        input.knockBackDir = new THREE.Vector3().subVectors(input.playerPostion,new THREE.Vector3(x,y,z)).normalize();
        input.knockBackMultiplier = multiplier;
        this.momentum.x += input.knockBackDir.x * multiplier * 10 ;
        this.momentum.z += input.knockBackDir.z * multiplier * 10 ;
        this.knockedBack = true;
      }
    }
    
    this.turn = function(input){
      this.inputMagZ = 1 / Math.abs(input.vector.z);
      this.inputMagX = 1 / Math.abs(input.vector.x);
      this.vect = normalize(input.vector);
      this.input.x = (this.vect.x  * (this.agility))/this.inputMagX;
      this.input.z = (this.vect.z  * (this.agility))/this.inputMagZ; 

      let erg = input.cameraDirection;

      if(erg.x == 0){erg.x += 0.0001};

      let erv = new THREE.Vector2(erg.x,erg.z);
      let rotatedInput = new THREE.Vector2(-this.input.z,this.input.x).rotateAround(new THREE.Vector2(0,0),erv.angle()); 

      this.move.x = rotatedInput.x ;
      this.move.z = rotatedInput.y ;
      this.movePosition.x = rotatedInput.x;
      this.movePosition.z = rotatedInput.y;
      this.movePosition.y = input.cameraPosition.y;

      if(input.grounded){
        this.grounded(input);
      } else {
        this.airborn(input);
      }
      this.applyGravity(input);
      this.applyMomentum(input);
    }

    this.surf = function(input){
      let mouseElapse = performance.now() - input.lastMouseMove;

      if(mouseElapse > 25){input.mouseMoveX = 0;}

      this.mouseMovedX = input.mouseMoveX;
      this.angleOfChange = new THREE.Vector2(this.movePosition.x, this.movePosition.z)
        .angleTo(new THREE.Vector2(this.momentum.x, this.momentum.z))/Math.PI;

      if(input.vector.x == 0 && input.vector.z == 0 || mouseElapse > 25){this.angleOfChange = 0;}

      if(Math.abs(this.angleOfChange) > this.surfMin && Math.abs(this.angleOfChange) < this.surfMax){
        this.surfing = true;
        input.mouseMoveX += input.mouseMoveX;
        input.mouseMoveX += input.mouseMoveX;
        if(input.mouseMoveX < 0){
          if(this.angleOfChange < -this.surfMax){this.angleOfChange = -this.surfMax}
          this.angleOfChange = THREE.MathUtils.clamp(THREE.MathUtils.clamp(-this.angleOfChange+.5,-.1,0) * input.d * 1000,-1,0);
        } else {
          if(this.angleOfChange > this.surfMax){this.angleOfChange = this.surfMax}
          this.angleOfChange = THREE.MathUtils.clamp(THREE.MathUtils.clamp(this.angleOfChange-.5,0,.1)  * input.d * 1000,0,1);}
          this.rotateMomentum = new THREE.Vector2(this.momentum.x, this.momentum.z).rotateAround(
          new THREE.Vector2(0,0),(this.angleOfChange ));
          this.momentum.x = this.rotateMomentum.x;
          this.momentum.z = this.rotateMomentum.y;
      } else {
       this.surfing = false;}
    }

    this.applyGravity = function(input){
      this.movePosition.y += (this.momentum.y + (this.momentum.y - this.grav * input.d));

      if(input.grounded && !input.jump){
        this.momentum.y = 0;
      } else{
        this.momentum.y -= this.grav * input.d;
      }
      this.translation.y = this.movePosition.y - input.cameraPosition.y;
    }

    this.grounded = function(input){
      if(this.midAir){
        //landing
        //this.momentum.x /= 1.5;
        //this.momentum.z /= 1.5;
        //this.knockedBack = false;
      }

      this.midAir = false;

      if(this.jumpReleased && input.jump){
        this.momentum.y = this.jumpAmp;
      } else {
        this.friction = this.groundFric;
        this.agility = this.groundAgil;
      }

      if(!input.jump){this.jumpReleased = true;}
    }

    this.airborn = function(input){
      this.friction = this.airFric;
      this.agility = this.airAgil;
      this.midAir = true;
      this.surf(input);

      if(input.jump){this.jumpReleased = false;} else {this.jumpReleased = true;}
    }

    this.applyMomentum = function(input){
      this.reorientation = new THREE.Vector2(this.movePosition.x, this.movePosition.z)
               .angleTo(new THREE.Vector2(this.momentum.x, this.momentum.z))/Math.PI;
      this.reorientation -= .5;
      this.reorientation = -this.reorientation + .5;
      this.reorientation = THREE.MathUtils.clamp(this.reorientation,0,.9) * 1.1;

      if(input.crouched || input.autoCrouched){
        this.move.x = this.move.x/2;
        this.move.z = this.move.z/2;
      }

      if(!this.sliding){
      this.momentum.x += this.move.x ;
      this.momentum.z += this.move.z ;
      }

      if(input.vector.x == 0 && input.vector.z == 0 || !this.isGrounded){this.reorientation = 1;}

      if(this.reorientation < .5 && !this.surfing){
        this.reorientation *= 2;
        if(this.airborn){this.reorientation = (this.reorientation+21)/22;}
        this.momentum.x *= this.reorientation;
        this.momentum.z *= this.reorientation;
      }

      this.vect = this.momentum;
      this.lat.x = input.cameraPosition.x;
      this.lat.y = input.cameraPosition.z;
      this.speed = this.lat.distanceTo(this.lastLat) * input.d * 1000
      this.lastLat.x = input.oldPosition.x;
      this.lastLat.y = input.oldPosition.z;
      this.vect = normalize(this.vect);

      if(!this.sliding){ 
      this.vect.x -= this.vect.x - (this.vect.x * this.friction * input.d);
      this.vect.z -= this.vect.z - (this.vect.z * this.friction * input.d);
      }

      this.lateralMomentum.x = this.momentum.x;
      this.lateralMomentum.z = this.momentum.z;
      this.momentum.x -= this.vect.x * ( (this.speed ) ) * input.d * 100;
      this.momentum.z -= this.vect.z * ( (this.speed ) ) * input.d * 100;
      this.translation.x = THREE.MathUtils.clamp(this.momentum.x/100,-this.maxMomentum,this.maxMomentum);
      this.translation.z = THREE.MathUtils.clamp(this.momentum.z/100,-this.maxMomentum,this.maxMomentum);

      if(this.speed == Infinity){
        this.momentum = { x: 0.0, y: 0.0, z: 0.0 };
        this.translation = { x: 0.0, y: 0.0, z: 0.0 };
      }

      /*input.colltest = input.collision.length;
      input.colltest -= 0.026;
      if(input.colltest <= 0.05 || this.midAir){input.colltest = 0}

      //if(!input.grounded){input.colltest /= 15}
      //if(!input.grounded){input.colltest /= 8}
      if(!input.grounded){input.collision.length = 0}

      this.momentum.x -= (this.momentum.x * (input.collision.length * 10));
      this.momentum.z -= (this.momentum.z * (input.collision.length * 10));*/

      if(!input.knockedBack){
        input.changeInVelocity = THREE.MathUtils.clamp(input.changeInVelocity,-1,0);

        if(Math.abs(input.changeInVelocity) < this.slopeTolerance){
          input.changeInVelocity = 0;
        }
      this.momentum.x += this.momentum.x * input.changeInVelocity;
      this.momentum.z += this.momentum.z * input.changeInVelocity;
      }

      if(this.momentum.length() < this.minSpeed){
        this.momentum.x = 0; this.momentum.z = 0;
      }

      if(input.reset){
        input.reset = false;
        this.momentum.x = 0;
        this.momentum.z = 0;
      }
    }
  }
}

function normalize(vec) {
    let norm = Object.assign({},vec);
    var length = Math.sqrt(norm.x*norm.x+norm.z*norm.z);
    norm.x = norm.x/length;
    norm.z = norm.z/length;
    if(!norm.x){norm.x = 0;}
    if(!norm.z){norm.z = 0;}

    return norm;
}



export function PointerLockControls( camera, THREE ) {

  var scope = this;

  var pitchObject = new THREE.Object3D();
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.position.y = 10;
  yawObject.add( pitchObject );

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;

  var isOnObject = false;
  var canJump = false;

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  var onMouseMove = function ( event ) {

    if ( scope.enabled === false ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;

    pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

  };

  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true; break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 10;
        canJump = false;
        break;

    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // a
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

    }

  };

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  this.enabled = false;

  this.getObject = function () {

    return yawObject;

  };

  this.isOnObject = function ( boolean ) {

    isOnObject = boolean;
    canJump = boolean;

  };

  this.update = function ( delta ) {

    if ( scope.enabled === false ) return;

    delta *= 0.1;

    velocity.x += ( - velocity.x ) * 0.08 * delta;
    velocity.z += ( - velocity.z ) * 0.08 * delta;

    velocity.y -= 0.25 * delta;

    if ( moveForward ) velocity.z -= 0.12 * delta;
    if ( moveBackward ) velocity.z += 0.12 * delta;

    if ( moveLeft ) velocity.x -= 0.12 * delta;
    if ( moveRight ) velocity.x += 0.12 * delta;

    if ( isOnObject === true ) {

      velocity.y = Math.max( 0, velocity.y );

    }

    yawObject.translateX( velocity.x );
    yawObject.translateY( velocity.y ); 
    yawObject.translateZ( velocity.z );

    if ( yawObject.position.y < 10 ) {

      velocity.y = 0;
      yawObject.position.y = 10;

      canJump = true;

    }

  };

};
