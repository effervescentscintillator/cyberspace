//import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

function normalize(vec) {
    let norm = Object.assign({},vec);
    var length = Math.sqrt(norm.x*norm.x+norm.z*norm.z);
    norm.x = norm.x/length;
    norm.z = norm.z/length;
    if(!norm.x){norm.x = 0;}
    if(!norm.z){norm.z = 0;}

    return norm;
}

export class Ent {
  constructor(THREE){

    this.move = { x: 0.0, y: 0.0, z: 0.0 };
        this.input = { x: 0.0, y: 0.0, z: 0.0 };
        this.movePosition = { x: 0, z: 0 };
        this.translation = { x: 0, y:0 , z: 0 };
    this.momentum = new THREE.Vector3(0,0,0);
    this.lateralMomentum = new THREE.Vector2(0,0);
    this.momentumError = 0;
    this.maxMomentum = 100;
    this.rotateMomentum = {};
    this.momentumOsc = { x: true, z: true};
    this.speed = 0;
    this.maxSpeed = 30;
    this.minSpeed = 0.01;
    this.grav = .0; //.15
    this.agility = 0;
    this.groundAgil = .6;
    this.airAgil = .05;
    this.groundFric = .9;
    this.friction = this.groundFric;
    this.airFric = 0; //03
    this.slideyness = 100;
    this.lat = new THREE.Vector2(0,0);
    this.lastLat = new THREE.Vector2(0,0);
    this.lastY = 0.0001;
    this.lookingBack = false;
    this.jumpReleased = true;
    this.jumpAmp = .00; //05
    this.surfAmp = 125;
    this.boost = 0;
    this.boostMaxSpeed = 30;
    this.surfMin = .45; //50 44 50 40
    this.surfMax = .525; //58 57 52
    this.surfing = false;
    this.angleOfChange = 0;
    this.isGrounded = true;
    this.lastGroundedY = 0;
    this.groundedYTolerance = .001;
    this.angleOfDirection = 0;
    this.rotateDirection = {};
    this.mouseMovedX = 0;
    this.reorientation;
    this.correctedMovement = {};
    this.offsetIt = 0;
    this.slopeTimeout = 0;
    this.slideTimeout = 0;
    this.sliding = false;
    this.trimpSpeed = 15;
    this.trimping = false;
    this.midAir = false;
    this.lat = new THREE.Vector3(0,0,0);
    this.lastLat = new THREE.Vector3(0,0,0);

    this.knockBack = function(x) {
      //console.log(x);
    }
    
    this.turn = function(input){

      this.movement(input);
    }

    this.movement = function(input){
      this.vect = normalize(input.vector);
      this.input.x = this.vect.x  * (this.agility);
      this.input.z = this.vect.z  * (this.agility); 

      let erg = input.cameraDirection;
      if(erg.x == 0){erg.x += 0.0001};
      let erv = new THREE.Vector2(erg.x,erg.z);
      //console.log(this.input);
      let rotatedInput = new THREE.Vector2(-this.input.z,this.input.x).rotateAround(new THREE.Vector2(0,0),erv.angle()); 

      this.move.x = rotatedInput.x ;

      this.move.z = rotatedInput.y ;
      this.movePosition.x = rotatedInput.x;
      this.movePosition.z = rotatedInput.y;
      this.movePosition.y = input.cameraPosition.y;
      //console.log(input.grounded + ' ' + input.jump + ' ' + input.jumpReleased);
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

      //if(collider.translation.x == undefined){
        //collider.translation.x = 0; collider.translation.z = 0;
      //}

      this.angleOfChange = new THREE.Vector2(this.movePosition.x, this.movePosition.z)
        .angleTo(new THREE.Vector2(this.momentum.x, this.momentum.z))/Math.PI;
        //console.log(Math.abs(input.mouseMoveX));
                //console.log(Math.abs(this.angleOfChange) > this.surfMin && Math.abs(this.angleOfChange) < this.surfMax);
        //console.log(Math.abs(this.angleOfChange));
                //console.log('max');
        //console.log(Math.abs(this.angleOfChange));
      //if(this.angleOfChange > 0.75){
      //  this.angleOfChange -= (this.angleOfChange - 0.75) * 4;
      //}

      //if(this.angleOfChange < 0.07 || this.angleOfChange == 0.5){this.angleOfChange = 0;}

      //if(input.vector.x == 0 && input.vector.z == 0 || mouseElapse > 25 || Math.abs(input.mouseMoveX) < 1){this.angleOfChange = 0;}
      if(input.vector.x == 0 && input.vector.z == 0 || mouseElapse > 25){this.angleOfChange = 0;}

//      if(Math.abs(this.angleOfChange) > this.surfMin && Math.abs(this.angleOfChange) < this.surfMax && this.vect.z == 0 && Math.abs(this.vect.x) == 1){
      if(Math.abs(this.angleOfChange) > this.surfMin && Math.abs(this.angleOfChange) < this.surfMax){
        //console.log('srf');
        this.surfing = true;
        //this.friction = -.25;
        /*if(input.mouseMoveX > 0){

          if(input.mouseMoveX > this.surfMax){
            input.mouseMoveX = this.surfMax - (input.mouseMoveX - this.surfMax);
          }
        
          input.mouseMoveX -= this.surfMin - (this.surfMax - input.mouseMoveX);
        } else{input.mouseMoveX += this.surfMin;}*/

        input.mouseMoveX += input.mouseMoveX;
        input.mouseMoveX += input.mouseMoveX;

        this.boost = this.surfAmp * (THREE.MathUtils.clamp(new THREE.Vector2(this.move.x, this.move.z).length(),0,1));
        //this.boost = THREE.MathUtils.clamp(this.boost,1,75);
        this.boost *= this.surfAmp * input.d;
        this.boost *= this.agility * 10000000000;
        this.boost = 1 + ((1 * input.d) * this.speed/10);

        //this.boost /= this.surfMin + ((this.surfMax - this.surfMin) / 2) - Math.abs(this.angleOfChange);

        //this.angleOfChange = this.surfMin;
              //console.log(this.angleOfChange + ' ' + this.surfMin);

        if(input.mouseMoveX < 0){
          if(this.angleOfChange < -this.surfMax){this.angleOfChange = -this.surfMax}
          this.angleOfChange = THREE.MathUtils.clamp(THREE.MathUtils.clamp(-this.angleOfChange+.5,-.1,0) * input.d * 1000,-1,0);
        } else {
          if(this.angleOfChange > this.surfMax){this.angleOfChange = this.surfMax}
          this.angleOfChange = THREE.MathUtils.clamp(THREE.MathUtils.clamp(this.angleOfChange-.5,0,.1)  * input.d * 1000,0,1);}
                      //console.log(this.angleOfChange + ' ' + this.surfMin);

        //if(this.)


        //if(1.9// > new THREE.Vector2(this.momentum.x, this.momentum.z).angleTo(new THREE.Vector2(this.rotateMomentum.x, this.rotateMomentum.z))){
                  //console.log(new THREE.Vector2(this.momentum.x, this.momentum.z).angleTo(new THREE.Vector2(this.rotateMomentum.x, this.rotateMomentum.z)));

          this.rotateMomentum = new THREE.Vector2(this.momentum.x, this.momentum.z).rotateAround(
          new THREE.Vector2(0,0),(this.angleOfChange ));
          //console.log(this.angleOfChange + ' ' + input.d)
          this.momentum.x = this.rotateMomentum.x;
          this.momentum.z = this.rotateMomentum.y;
        //}

      } else {//this.friction = this.airFric;
       this.surfing = false;}
      
      if(this.mouseMovedX == 0){this.boost = 0;}
      
    }

    this.applyGravity = function(input){
      //console.log(this.momentum.y + ' ' + this.momentum.x + ' ' + this.momentum.z + ' ' + input.grounded);
      this.movePosition.y += (this.momentum.y + (this.momentum.y - this.grav * input.d)) ;
      if(input.grounded && !input.jump){
        this.momentum.y = 0;
      } else{
        this.momentum.y -= this.grav * input.d;
      }
      //this.move.y = this.movePosition.y - input.cameraPosition.y;
      this.translation.y = this.movePosition.y - input.cameraPosition.y;
    }

    this.grounded = function(input){
      //this.lastGroundedY = collider.translation().y;
      //if(this.momentum.y > 0.01){this.momentum.y /= 5;}
      this.midAir = false;
      if(this.jumpReleased && input.jump){
        this.momentum.y = this.jumpAmp;
        //this.friction = this.airFric;
        //this.agility = this.airAgil;
      } else {
        this.friction = this.groundFric;
        this.agility = this.groundAgil;
      }
      this.boost = 0;
      if(!input.jump){this.jumpReleased = true;}
    }

    this.airborn = function(input){
      this.friction = this.airFric;
      this.agility = this.airAgil;
      this.midAir = true;

      this.boost = 0;
      this.surf(input);

      //if(this.momentum.y > .01){player.disableAutostep(); player.disableSnapToGround();}
      //else {player.enableAutostep(0.5, 0.2, true); player.enableSnapToGround(.1);}

      if(input.jump){this.jumpReleased = false;} else {this.jumpReleased = true;}
    }

    this.applyMomentum = function(input){
      //this.normalizeMomentum();
      //this.preventMomentumZero();

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
      //console.log(this.vect);
      if(!this.sliding){ 
      this.vect.x = this.vect.x * (this.friction);
      this.vect.z = this.vect.z * (this.friction);
      }
            //console.log(this.vect);

      //console.log(this.vect.x + ' ' + this.vect.z + ' n ' + normalize(this.vect).x + ' ' + normalize(this.vect).z);
            //console.log(this.speed);
      this.lateralMomentum.x = this.momentum.x;
      this.lateralMomentum.z = this.momentum.z;
      this.momentum.x -= this.vect.x * ( (this.speed ) ) * input.d * 100;
      this.momentum.z -= this.vect.z * ( (this.speed ) ) * input.d * 100;
      //console.log(this.momentum.length() + ' ' + this.speed);
      //this.lastLat.x = this.translation.x;
      //this.lastLat.y = this.translation.z;
      this.translation.x = THREE.MathUtils.clamp(this.momentum.x/100,-this.maxMomentum,this.maxMomentum);
      this.translation.z = THREE.MathUtils.clamp(this.momentum.z/100,-this.maxMomentum,this.maxMomentum);

      //this.speed = this.lat.distanceTo(this.lastLat) / input.d;
      if(this.speed == Infinity){
        console.log('inf');
        this.momentum = { x: 0.0, y: 0.0, z: 0.0 };
        this.translation = { x: 0.0, y: 0.0, z: 0.0 };
      }


      //console.log(this.translation);
      //input.collision = normalize(input.collision);
      //console.log(this.speed);
      input.colltest = input.collision.length;
      if(!input.grounded){input.colltest /= 10}
        //console.log(input.colltest);
        this.momentum.x -= (this.momentum.x * (input.colltest));
        this.momentum.z -= (this.momentum.z * (input.colltest));
        //this.momentum.x -= (this.momentum.x/100 * (input.collision.length*100))*2;
      if(input.reset){
        input.reset = false;
        this.momentum.x = 0;
        this.momentum.z = 0;
      }
      //this.momentum.y -= (this.momentum.y * (input.collision.y*10))*2;
      //console.log(input.collision.y);
      //this.momentum.y -= this.momentum.z * input.collision.z;
    }

    this.collisionDetection = function(input){
       


      if(Math.abs(this.move.x) < 0.0001 || Math.abs(this.move.x) > 1){this.move.x = 0;}
      if(Math.abs(this.move.z) < 0.0001 || Math.abs(this.move.z) > 1){this.move.z = 0;}

      //console.log(this.sliding );
      if(this.sliding){console.log('slid ' + this.testmove.y + ' ' + this.trimping); this.slideTimeout = 10;} else {this.slideTimeout--;}
      this.sliding = false;
      if(this.move.x > 1){alert('1');}
      player.computeColliderMovement(collider, this.move, 8, 0x00020001);

      this.correctedMovement = player.computedMovement();

            //console.log( player.computedCollision(0) + ' ' + this.move.z + ' ' + this.correctedMovement.z + ' ' + this.move.x + ' ' + this.correctedMovement.x + ' ' + player.computedGrounded());

      //if (Math.abs(Math.abs(this.move.z) - Math.abs(this.correctedMovement.z)) > 0.1 || Math.abs(Math.abs(this.move.x) - Math.abs(this.correctedMovement.x)) > 0.1 && player.computedCollision(0) == null){
        //this.correctedMovement = this.move;
      //}

      //if(this.correctedMovement.x == 0 && this.move.x !== 0){this.correctedMovement.x = -this.move.x / 100;}
      //if(this.correctedMovement.z == 0 && this.move.z !== 0){this.correctedMovement.z = -this.move.z / 100;}
      if(this.correctedMovement.x == 0 && this.move.x !== 0 && this.sliding == false && this.slideTimeout < 0){
          player.setOffset(0);
          //this.correctedMovement.x = -this.move.x / 1000000000;
          //player.computeColliderMovement(collider, this.move, 8); 
          //console.log('x '+this.move.x);
          //player.setMaxSlopeClimbAngle(89 * Math.PI / 180);
          //player.setMinSlopeSlideAngle(1 * Math.PI / 180);
      }
      if(this.correctedMovement.z == 0 && this.move.z !== 0 && this.sliding == false && this.slideTimeout < 0){
        player.setOffset(0);
        //this.correctedMovement.z = -this.move.z / 1000000000;
        //player.computeColliderMovement(collider, this.move, 8); 
        //console.log('z '+this.move.z);
        //player.setMaxSlopeClimbAngle(89 * Math.PI / 180);
        //player.setMinSlopeSlideAngle(1 * Math.PI / 180);

      }
      //if(this.correctedMovement.x == 0 && this.move.x !== 0){console.log('f');}
      //console.log(player.offset());
      //player.setOffset(0.000001);
      //this.momentum.x -= this.momentum.x * Math.abs(this.correctedMovement.x - this.move.x);
      //this.momentum.z -= this.momentum.z * Math.abs(this.correctedMovement.z - this.move.z);
      //this.momentum.y -= this.momentum.y * Math.abs(this.correctedMovement.y - this.move.y);
      this.momentum.x -= this.momentum.x * input.collision.x;
      this.momentum.z -= this.momentum.y * input.collision.y;
      this.momentum.y -= this.momentum.z * input.collision.z;


      this.camDirection = new THREE.Vector3();
      this.camDirection = camera.getWorldDirection(this.camDirection);
      this.angleOfDirection = new THREE.Vector2(this.camDirection.x, this.camDirection.z)
        .angleTo(new THREE.Vector2(this.momentum.x, this.momentum.z))/Math.PI;

      if(this.angleOfDirection > .5){this.lookingBack = true;}
      else {this.lookingBack = false;}

      this.correctedMovement.x += collider.translation().x;
      this.correctedMovement.y += collider.translation().y;
      this.correctedMovement.z += collider.translation().z;

      //console.log(this.correctedMovement.y - this.lastY);
      if((this.correctedMovement.y - this.lastY) > .08 && (this.correctedMovement.y - this.lastY) < .1){
        //console.log((this.correctedMovement.y - this.lastY) );
        /*
          this.move.x = 0; this.move.z = 0;
        player.computeColliderMovement(collider, this.move, 8);

        this.correctedMovement = player.computedMovement();
        this.correctedMovement.x += collider.translation().x;
        this.correctedMovement.y += collider.translation().y;
        this.correctedMovement.z += collider.translation().z;

        this.lastY = 0;

        this.slopeTimeout += 100;
      */} 

      camera.position.x = this.correctedMovement.x;
      camera.position.y = this.correctedMovement.y;
      camera.position.z = this.correctedMovement.z;

      collider.setTranslation(camera.position);

      this.lat.x = camera.position.x;
      this.lat.y = camera.position.z;

      this.speed = this.lat.distanceTo(this.lastLat) / input.d; 

      if(this.speed == Infinity){
        this.momentum = { x: 0.0, y: 0.0, z: 0.0 };
        camera.position.x = this.lastLat.x;
        camera.position.z = this.lastLat.y;
        collider.setTranslation(camera.position);
      } else {
        this.lastLat.x = camera.position.x;
        this.lastLat.y = camera.position.z;
      }
      //this.speed = 30;
      if (this.speed > this.maxSpeed){this.speed = this.maxSpeed;}
      if (this.speed < this.minSpeed){this.speed = this.minSpeed;}

      if(this.lastY !== 0){ this.lastY = camera.position.y;} else {this.lastY = 0.0001;}
    }

    this.preventMomentumZero = function(){
      //this.momentum.x += Math.floor(Math.random() * 2) * .001;
      //this.momentum.x -= Math.floor(Math.random() * 2) * .001;
      //this.momentum.z += Math.floor(Math.random() * 2) * .001;
      //this.momentum.z -= Math.floor(Math.random() * 2) * .001;

      if(Math.floor(Math.random() * 2)){
        this.momentum.x += .001;
        this.momentum.z += .001;
      } else {
        this.momentum.x -= .001;
        this.momentum.z -= .001;
      }

      //if(true){if(this.momentumOsc.x){this.momentum.x += 1; this.momentumOsc.x = false}else{this.momentum.x -= 1; this.momentumOsc.x = true;}}
      //if(true){if(this.momentumOsc.z){this.momentum.z += 1; this.momentumOsc.z = false}else{this.momentum.z -= 1; this.momentumOsc.z = true;}}
      //console.log(Math.floor(Math.random() * 2));
    }

    this.normalizeMomentum = function(){
      let jfc = Math.abs(this.move.x) + Math.abs(this.move.z) - new THREE.Vector2(this.move.x,this.move.z).length();

      if(this.move.x > 0){this.move.x -= Math.abs(jfc /2);}
      if(this.move.x < 0){this.move.x += Math.abs(jfc /2);}

      if(this.move.z < 0){this.move.z += Math.abs(-jfc /2);}
      if(this.move.z > 0){this.move.z -= Math.abs(-jfc /2);}

      let newTest = Math.abs(this.momentum.x) + Math.abs(this.momentum.z) - new THREE.Vector2(this.momentum.x,this.momentum.z).length();
      let testvar = this.speed * 819 + 1;

      if(this.momentum.x > 0){this.momentum.x -= newTest /testvar * new THREE.Vector2(this.momentum.x,this.momentum.z).length();}
      if(this.momentum.x < 0){this.momentum.x += newTest /testvar * new THREE.Vector2(this.momentum.x,this.momentum.z).length();}

      if(this.momentum.z < 0){this.momentum.z += newTest /testvar * new THREE.Vector2(this.momentum.x,this.momentum.z).length();}
      if(this.momentum.z > 0){this.momentum.z -= newTest /testvar * new THREE.Vector2(this.momentum.x,this.momentum.z).length();}
    }
  }
}