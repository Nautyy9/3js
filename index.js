import './style.css'


import * as THREE from 'https://unpkg.com/three@0.144.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import * as dat from 'dat.gui'
import gsap from 'gsap';


const gui  = new dat.GUI();


const world = {
  plane : {
    width: 400,
    height: 400,
    widthSegment: 50,
    heightSegment: 50,

  }
}

gui.add(world.plane, 'width', 1 ,400).onChange(planeGuiSetting)
gui.add(world.plane, 'height', 1 ,400).onChange(planeGuiSetting)
gui.add(world.plane, 'widthSegment', 1 ,100).onChange(planeGuiSetting)
gui.add(world.plane, 'heightSegment', 1 ,100).onChange(planeGuiSetting)


function planeGuiSetting() {
    planeMesh.geometry.dispose();
    planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width,world.plane.height,world.plane.widthSegment, world.plane.heightSegment)

    const {array} = planeMesh.geometry.attributes.position;
    const randomValues = []
    
    for(var i=0; i< array.length; i++)
      {
       if( i% 3  === 0){
          const x = array[i];
          const y = array[i+1];
          const z = array[i+2];
          
          array[i] =     x + (Math.random() - 0.5)*5;
          array[i + 1] = y + (Math.random() - 0.5)*5;
          array[i + 2] = z + (Math.random() - 0.5)*5;
          
       }
       randomValues.push(((Math.random() -0.5*Math.PI))*5 )
      } 

         planeMesh.geometry.attributes.position.randomValues = randomValues;
         planeMesh.geometry.attributes.position.originalArray = planeMesh.geometry.attributes.position.array;
        // console.log('one',one,'two', two);
        // console.log(planeMesh.geometry.attributes.position);



        const colors = [];
        for(let i =0; i<planeMesh.geometry.attributes.position.count; i++){
          colors.push(0,0.19,0.4);
        }
        planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));


        



  }

 
  document.addEventListener('mousemove',  (event) => {
    
    const x =  mouse.x = (event.clientX / innerWidth) * 2 - 1;
    const y = mouse.y = -(event.clientY/ innerHeight) * 2 + 1;
    //  console.log({x, y});
  });


  const mouse = {
    x: undefined,
    y: undefined
  }

  

  const raycaster  = new THREE.Raycaster();
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
  
  // console.log(raycaster);

//const geometry = new THREE.BoxGeometry(1, 1, 1)
const planeGeo = new THREE.PlaneGeometry(world.plane.width,world.plane.height,world.plane.widthSegment, world.plane.heightSegment);

//const material = new THREE.MeshBasicMaterial({color: 0x00ff00  });
// const planeMat = new THREE.MeshBasicMaterial({color : 0xff0000, side: THREE.DoubleSide}) //double side make  both side of plane visible to us
const planeMat = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, flatShading: true, vertexColors: true}) //make us able to add light effect to our plane although our plane go black until we set light property


//const mesh = new THREE.Mesh(geometry, material);
const planeMesh = new THREE.Mesh(planeGeo, planeMat)

//scene.add(mesh);
scene.add(planeMesh);

//call the main gui function (planeGuiSetting()) as some of the attributes were needed by whole like color and gui attributes

planeGuiSetting();



const light = new THREE.DirectionalLight(0xffffff , 1)
light.position.set(0,-1,1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff ,1)
light.position.set(0,0,-1);
scene.add(backLight);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement);

  var frame = 0;

  function animate () {
    //render every time(loop) and draws scene every time the screem is refreshed , same like setInterval(60 time per sec) but better to use requestAnimationFrame over setInterval , as it stops on page change
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    

    //floating effect
    frame += 0.01;

    const {array, originalArray, randomValues} = planeMesh.geometry.attributes.position;
    // console.log('randomValues',randomValues,'originalArray', originalArray, 'array',array);
    
    for(let i =0; i<array.length; i+=3){
      //for x
      array[i] = originalArray[i] + Math.cos(frame, randomValues[i])* 0.004;
      //for y
      array[i+1] = originalArray[i+1] + Math.sin(frame, randomValues[i+1])* 0.004;

        array[i+2] = originalArray[i+2] + Math.sin(frame, randomValues[i+2])* 0.001;


    }
    planeMesh.geometry.attributes.position.needsUpdate = true

    //raycaster and hover color
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObject(planeMesh);
    if(intersect.length> 0 ){
      // console.log(mouse.x, mouse.y);
      const {color} =  intersect[0].object.geometry.attributes;
     

       const initialColor = {
        r: 0,
        g: 0.19,
        b: 0.4
       }
       const hoverColor ={
        r: 0.1,
        g: 0.5,
        b: 1
       }

       gsap.to(hoverColor, {
        r: initialColor.r,
        g: initialColor.g,
        b: initialColor.b,
        duration: 1,
        onUpdate: () =>{
           //Vertex 1
       color.setX(intersect[0].face.a, hoverColor.r);
       color.setY(intersect[0].face.a, hoverColor.g);
       color.setZ(intersect[0].face.a, hoverColor.b);
       //Vertex 2
       color.setX(intersect[0].face.b, hoverColor.r);
       color.setY(intersect[0].face.b, hoverColor.g);
       color.setZ(intersect[0].face.b, hoverColor.b);
       //Vertex 3
       color.setX(intersect[0].face.c, hoverColor.r);
       color.setY(intersect[0].face.c, hoverColor.g);
      color.setZ(intersect[0].face.c, hoverColor.b);
      color.needsUpdate = true;
        }
       })
    }
   // 
    // console.log(intersect);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // planeMesh.rotation.x +=0.01;
}
animate();


new OrbitControls( camera, renderer.domElement );//this function doesn't show our plan if we rotate back bcz we don't have any light at back so we've created backlight and added to the scene 

camera.position.z = -50;

// const buffer = new THREE.BufferAttribute();
// console.log(planeMesh.geometry.attributes);
// our planeMesh.geometry.attributes takes in arguement of type bufferAttribute and we map values according to the itemSize , count and other given values for our count value we've 3 values (x,y,z) and is defined in ([x,y,z], itemSize(3)) [x,y,z ] vertices are responsible for altering rgb color in our case r is represented by x g->y and b->z
