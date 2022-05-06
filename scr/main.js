//Creación de un robot animado. Paula Higuera Consuegra 2021-2022
var scene, renderer, suelo, modelo, cuerpo, arma, robot;
//Variables para el sonido de la escena
var audioListener, voz, audioRotacion, sonido, sonido1;
//Variables de la luz
var light, pointlight;
//Todas las partes y detalles del robot
var cabeza, cuello, ojo1, ojo2, contornojo1, contornojo2, codo, bajo, brazo, torso, antenaL, antenaC, laser, mango;
//Variables de tamaño de la ventana
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
//Variables de las camaras
var cameraControls, camera, camaravista;
//Variables para la realización de las animaciones
var cont = 0, desplegado, step = 0.1, d;
const controles = {

    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    crouch: false,
    jump: false,
    attack: false,
    armar: false,
    cam: false,
    talk: false,
    run: false

};

init();
animate();

/**Función de inicio donde creo los elementos principales de la escena, las luces, cámaras,el suelo,los audios
 * los controles de la camara principal, pueblo la escena con las partes del modelo, añado las sombras,y llamo a los
 * eventos*/
function init() {
    //***********************************************Crear escena*******************************************************
    scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load("../Texturas/cielo.png");
    scene.fog = new THREE.Fog(0x000000, 2000, 4000);
    //************************************************Camara************************************************************
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 150, 1300);
    //*Creo la camara de punto de vista de BB8**************************************************************************
    camaravista = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camaravista.position.set(2, 158, 36);
    camaravista.rotation.y = Math.PI;
    //************************************************Render************************************************************
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //Añade la salida del renderer al documento HTML
    document.body.appendChild(renderer.domElement);
    //*************************************************Audio************************************************************
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    sonido = new THREE.Audio(audioListener);
    sonido1 = new THREE.Audio(audioListener);
    voz = new THREE.AudioLoader();
    voz.load('../Audio/bb8.mp3', function (buffer) {
        sonido.setBuffer(buffer);
        sonido.setLoop(true);
        sonido.setVolume(0.9);
    });
    voz.muted = true;
    audioRotacion = new THREE.AudioLoader();
    audioRotacion.load('../Audio/bb8_beep_beep.mp3', function (buffer) {
        sonido1.setBuffer(buffer);
        sonido1.setLoop(true);
        sonido1.setVolume(0.5);
    });
    audioRotacion.muted = true
    //***************************************Iluminación de la escena***************************************************
    //**Luz Ambiente****************************************************************************************************
    scene.add(new THREE.AmbientLight(0x777777, 3));
    //**Luz Direccional*************************************************************************************************
    light = new THREE.DirectionalLight(0x777777);
    light.position.set(200, 700, 500);
    light.penumbra = 0.9;
    light.castShadow = true;//Sombras dinámicas
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 100;
    light.shadow.camera.far = 1200;
    light.shadow.camera.left = -1000;
    light.shadow.camera.right = 1000;
    light.shadow.camera.top = 350;
    light.shadow.camera.bottom = -350;
    scene.add(light);
    //**Luz que desprenderá el sable laser******************************************************************************
    pointlight = new THREE.PointLight(0xf11e14, 10, 200, 2);
    pointlight.position.set(47, 134, 67.5);
    //*****************************************Controles de camara******************************************************
    if (controles.cam === false) cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    if (controles.cam === true) cameraControls = new THREE.OrbitControls(camaravista, renderer.domElement);
    cameraControls.target.set(0, 50, 0)
    //***************************************Elementos escena***********************************************************
    //**Suelo***********************************************************************************************************
    suelo = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load("../Texturas/grasslight-big.jpg")
    }));
    suelo.rotation.x = -Math.PI / 2
    suelo.material.map.repeat.set(16, 16);
    suelo.material.map.wrapS = THREE.RepeatWrapping;
    suelo.material.map.wrapT = THREE.RepeatWrapping;
    suelo.material.map.encoding = THREE.sRGBEncoding;
    //**Sable laser*****************************************************************************************************
    partesarma();
    //**Modelo BB-8*****************************************************************************************************
    partesModelo();
    //***********************************************Poblar escena******************************************************
    scene.add(suelo);
    robot = new THREE.Group();
    robot.add(modelo);
    robot.add(cuerpo);
    scene.add(robot);
    //**************************************************Sombras*********************************************************
    suelo.receiveShadow = true;
    cabeza.receiveShadow = true;
    cuello.receiveShadow = true;
    torso.receiveShadow = true;

    cabeza.castShadow = true;
    antenaL.castShadow = true;
    antenaC.castShadow = true;
    ojo1.castShadow = true;
    ojo2.castShadow = true;
    contornojo1.castShadow = true;
    contornojo2.castShadow = true;
    cuello.castShadow = true;
    bajo.castShadow = true;
    codo.castShadow = true;
    torso.castShadow = true;
    mango.castShadow = true;
    //************************************************Eventos***********************************************************
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

/**
 * Función donde creo y posiciono los elemento 3D y 2D de lo que va a ser mi modelo de robot, los agrupo según la parte del
 * cuerpo a la que pertenezcan
 * Materiales usados
 * StandardMaterial para el reto del cuerpo puesto que es metal, añado la propiedad metalness con diferente grado para
 * cada parte del cuerpo
 * PhongMaterial para las cámaras de los ojos para que tengan reflectividad, pues es cristal
 * */
function partesModelo() {

    //**Cabeza de BB-8**************************************************************************************************
    cabeza = new THREE.Mesh(new THREE.SphereGeometry(40, 150, 150, 0, Math.PI * 2, 0, 1.57), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/Head ring diff MAP.jpg"),
        metalness: 0.7
    }));
    cabeza.position.y = 143;
    cabeza.rotation.y = -0.5;
    cuello = new THREE.Mesh(new THREE.CylinderGeometry(39, 30, 10, 16, 4, false), new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.7
    }));
    cuello.position.y = 140;
    cuello.rotation.y = -0.5;
    //*Ojos de BB-8******************************************************************************************************
    ojo1 = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 12, 0, Math.PI * 2, 0, 1.18), new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("../Texturas/Ojos.jpeg"),
        refractionRatio: 0.9
    }));
    contornojo1 = new THREE.Mesh(new THREE.TorusGeometry(6, 1.23, 20, 20, Math.PI * 2.), new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.6
    }));
    ojo1.position.set(22, 154, 25);
    ojo1.rotation.z = -1.6;
    ojo1.rotation.y = -0.7;
    ojo1.rotation.x = -0.3;
    contornojo1.position.set(25, 156, 29);
    contornojo1.rotation.y = 0.65;
    contornojo1.rotation.x = -0.3;
    ojo2 = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, 1.18), new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("../Texturas/Ojos.jpeg"),
        refractionRatio: 0.9
    }));
    contornojo2 = new THREE.Mesh(new THREE.TorusGeometry(11, 1.23, 20, 20, Math.PI * 2.), new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.6
    }));
    ojo2.position.set(2, 158, 30);
    ojo2.rotation.z -= 1.2;
    ojo2.rotation.y += -1.5;
    ojo2.rotation.x += 0.1;
    contornojo2.position.set(2, 160, 36);
    contornojo2.rotation.y = 0.04;
    contornojo2.rotation.x -= 0.4;
    //*Antenas**********************************************************************************************************
    antenaL = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 30), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/Mantena.jpg"),
        metalness: 0.8
    }));
    antenaL.position.set(-10, 174, -30);
    antenaC = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/Mantenapequeña.jpg"),
        metalness: 0.8
    }));
    antenaC.position.set(-15, 171, -28);
    //**Cuerpo de BB-8**************************************************************************************************
    torso = new THREE.Mesh(new THREE.SphereGeometry(70, 100, 100), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/Body diff MAP.jpg"),
        metalness: 0.8
    }));
    torso.position.y = 70;
    //*Brazo metálico BB-8**********************************************************************************************
    bajo = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 70, 39, 39), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/metal.jpg"),
        metalness: 0.8
    }));
    bajo.position.set(7, 100, 25);
    bajo.rotation.x = -1.5;
    bajo.rotation.z = 0.6;
    bajo.rotation.y = -0.4;
    codo = new THREE.Mesh(new THREE.SphereGeometry(3, 20, 20), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/metal.jpg"),
        metalness: 0.8
    }));
    codo.position.set(25, 105.5, 54);
    codo.rotation.x = -1.5;
    codo.rotation.z = 0.6;
    codo.rotation.y = -0.5;
    //*****Creo las uniones de elementos necesarias para un modelo compacto a la hora de aplicar las animaciones********
    //**Grupo de elementos que forman la cabeza*************************************************************************
    modelo = new THREE.Group();
    modelo.add(cabeza);
    modelo.add(ojo1);
    modelo.add(contornojo1);
    modelo.add(ojo2);
    modelo.add(contornojo2);
    modelo.add(cuello);
    modelo.add(antenaL);
    modelo.add(antenaC);
    modelo.add(camaravista);
    //**Articulaciones del brazo del robot******************************************************************************
    brazo = new THREE.Group();
    brazo.add(codo);
    brazo.add(bajo);
    brazo.add(arma);
    //**Grupo de elementos que forman el cuerpo del robot***************************************************************
    cuerpo = new THREE.Group();
    cuerpo.add(torso);
    cuerpo.add(brazo);

}

/**
 * Función donde creo y posiciono el sable laser y agrupo sus piezas
 * Materiales usados
 * StandardMaterial para el reto del cuerpo puesto que es metal, añado la propiedad metalness para el mango
 * y con el atributo emissiveIntensity añado la propiedad de emitir luz para el laser
 * */
function partesarma() {
    laser = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2.5, 50, 39, 39), new THREE.MeshStandardMaterial({
        emissive: new THREE.Color(0xf11e14),
        emissiveIntensity: 0.7
    }));
    mango = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 20, 50, 50), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("../Texturas/mango.jpg"),
        metalness: 0.9
    }));
    mango.position.set(30, 106, 60);
    laser.position.set(47, 130, 67.5);
    mango.rotation.x += 0.3;
    mango.rotation.z -= 0.6;
    laser.rotation.x += 0.3;
    laser.rotation.z -= 0.6;
    arma = new THREE.Group();
    arma.add(mango);
    arma.add(pointlight);
    arma.add(laser);

}

/**
 * Función para implementar las animaciones que podrá hacer el robot*/
function animaciones() {
    arma.visible = controles.armar === true;
    if (controles.moveRight === true && (controles.moveForward === true || controles.moveBackward === true)) {
        brazo.visible = true;
        cuerpo.rotation.y -= step;

    }
    if (controles.moveLeft === true && (controles.moveForward === true || controles.moveBackward === true)) {
        brazo.visible = true;
        cuerpo.rotation.y += step;

    }
    if (controles.moveRight === false && controles.moveLeft === false && controles.moveForward === true) {
        while(cont!==0){
            brazo.position.x -= 1;
            brazo.position.z -= 1;
            cont--;
        }
        brazo.visible=false;
        arma.visible = false;
        controles.armar = false;
        cuerpo.visible = true;
        d = new THREE.Vector3();
        modelo.getWorldDirection(d);
        if (controles.run === false) {
            robot.translateOnAxis(d, 2);
            torso.rotateX(+0.1);
        } else {
            robot.translateOnAxis(d, 3);
            torso.rotateX(+0.9);
        }


    }
    if (controles.moveRight === false && controles.moveLeft === false && controles.moveBackward === true) {
        while(cont!==0){
            brazo.position.x -= 1;
            brazo.position.z -= 1;
            cont--;
        }
        brazo.visible=false;
        arma.visible = false;
        controles.armar = false;
        cuerpo.visible = true;
        d = new THREE.Vector3();
        modelo.getWorldDirection(d);
        if (controles.run === false) {
            robot.translateOnAxis(d, -2);
            torso.rotateX(-0.1);
        } else {
            robot.translateOnAxis(d, -3);
            torso.rotateX(-0.9);
        }
    }

    if (controles.moveLeft === true) {
        brazo.visible = true;
        cuerpo.visible = true;
        modelo.rotation.y += step;
        sonido1.play();
    }
    if (controles.moveRight === true) {
        brazo.visible = true;
        cuerpo.visible = true;
        modelo.rotation.y -= step;
        sonido1.play();

    }

    if (controles.moveRight === false && controles.moveLeft === false) sonido1.pause();
    if (controles.crouch === true) {
        if (cont === 49) desplegado = true;
        if (cont === 0) desplegado = false;
        brazo.visible = true;
        if (!desplegado) {
            brazo.position.x += 1;
            brazo.position.z += 1;
            cont++;
        } else {
            brazo.position.x -= 1;
            brazo.position.z -= 1;
            cont--;
        }
        controles.crouch = false;
    }
    if (cont < 5) {
        arma.visible = false;
        controles.armar = false;
    }
    if (controles.talk === true) {
        sonido.play();
    }
    if (controles.talk === false) {
        sonido.pause();
    }
}

/**
 * Función para reajustar la pantalla en caso de cambio*/
function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

}

/**
 * Función para controles, de teclas pulsadas
 * @param event, evento de teclado*/
function onKeyDown(event) {
    switch (event.code) {

        case 'KeyW':
            controles.moveForward = true;
            break;
        case 'KeyS':
            controles.moveBackward = true;
            break;
        case 'KeyA':
            controles.moveLeft = true;
            break;
        case 'KeyD':
            controles.moveRight = true;
            break;
        case 'KeyE':
            controles.crouch = true;
            break;
        case 'KeyR':
            controles.talk = true;
            break;
        case 'KeySpace':
            controles.run = true;
            break;
    }
    //Estos eventos no son de mantener pulsado sino de cambio cada vez que pulsas la tecla
    if (event.code === 'KeyC') {
        controles.cam = !controles.cam;
    }

    if (event.code === 'KeyQ' && cont > 5) {
        controles.armar = !controles.armar;
    }

}

/**
 * Función para controles, de teclas sin pulsar
 * @param event, evento de teclado*/
function onKeyUp(event) {

    switch (event.code) {
        case 'KeyW':
            controles.moveForward = false;
            break;
        case 'KeyS':
            controles.moveBackward = false;
            break;
        case 'KeyA':
            controles.moveLeft = false;
            break;
        case 'KeyD':
            controles.moveRight = false;
            break;
        case 'KeyR':
            controles.talk = false;
            break;
        case 'KeySpace':
            controles.run = false;
            break;
    }
}

/**
 * Función de reactualización de escena, dependiendo si del control C se reactualizara desde una camara u otra*/
function animate()  {
    animaciones();
    requestAnimationFrame(animate);
    cameraControls.update();
    if (controles.cam === false) renderer.render(scene, camera);
    if (controles.cam === true) renderer.render(scene, camaravista);
}

//************************************************Creo la ventana de ayuda **********************************************
/**Función del botón de ayuda que crea la ventana emergente con las guias de uso del robot*/
function help() {
    Swal.fire({
        imageUrl: '../Texturas/helptext.PNG',
        imageHeight: 400,
        imageAlt: 'A tall image'
    })
}
