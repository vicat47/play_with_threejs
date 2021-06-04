import * as THREE from "./three.module.js";

let mouseState = false;
let lastXPoint = 0;
let lastYPoint = 0;

function main() {
    // 关联画布和 Three.js
    const canvas = document.querySelector("#canv");
    const itemList = [];
    const render = new THREE.WebGLRenderer({
        canvas:canvas,
        //增加下面两个属性，可以抗锯齿
        antialias:true,
        alpha:true
    });

    // 创建相机
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

    // 创建场景
    const scene = new THREE.Scene();

    // 创建一个正方体
    const boxWidth = 0.1;
    const boxHeight = 0.1;
    const boxDepth = 0.1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // 创建一个材质
    const material = new THREE.MeshPhongMaterial({
        color: 0x00FF00
    });

    // 为方块添加一个网格
    const cube = new THREE.Mesh(geometry, material);
    itemList.push(cube);
    // 将网格加入场景
    scene.add(cube);

    // 添加光照
    {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // 将场景和摄像机传给渲染器渲染场景
    render.render(scene, camera);

    document.addEventListener("mousedown", e => {
        mouseState = true;
        let canvasRect = canvas.getBoundingClientRect();
        let posInCanvasX = e.clientX - canvasRect.x;
        let posInCanvasY = e.clientY - canvasRect.y;
        console.log("屏幕坐标 x: " + posInCanvasX + "， y: " + posInCanvasY);
        let x1 = (posInCanvasX / canvasRect.width) * 2 - 1;
        let y1 = -(posInCanvasY / canvasRect.height) * 2 + 1;
        console.log("标准坐标 x: " + x1 + "， y: " + y1);

        // 屏幕坐标转换为世界坐标
        let world_vector = new THREE.Vector3(x1, y1, 0.5);
        let world = world_vector.unproject(camera);
        world.sub( camera.position ).normalize();
        var distance = (0 - camera.position.z) / world.z;
        world.multiplyScalar(distance);

        console.log("世界坐标 x: " + world.x + "， y: " + world.y);
        console.log(world);
        // 创建一个正方体
        const boxWidth = 0.1;
        const boxHeight = 0.1;
        const boxDepth = 0.1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

        // 创建一个材质
        const material = new THREE.MeshPhongMaterial({
            color: 0x00FFFF
        });

        // 为方块添加一个网格
        const clickCube = new THREE.Mesh(geometry, material);
        clickCube.position.set(world.x, world.y, 0);
        itemList.push(clickCube);

        // 将网格加入场景
        scene.add(clickCube);
    });

    document.addEventListener("mouseout", e => {
        mouseState = false;
    });

    document.addEventListener("mouseup", e => {
        mouseState = false;
    });

    document.addEventListener("mousemove", e => {
        if (mouseState) {
            for (const c of itemList) {
                c.rotation.y += ((e.clientX - lastXPoint) / 500);
                c.rotation.x += ((e.clientY - lastYPoint) / 500);
            }
        }
        lastXPoint = e.clientX;
        lastYPoint = e.clientY;
        render.render(scene, camera);
    });

    document.addEventListener("keydown", e=> {
        if (e.key.toLowerCase() === "w") {
            camera.position.z -= 0.01
        } else if (e.key.toLowerCase() === "s") {
            camera.position.z += 0.01
        } else if (e.key.toLowerCase() === "a") {
            camera.position.x -= 0.01
        } else if (e.key.toLowerCase() === "d") {
            camera.position.x += 0.01
        }
    });

    if (resizeRendererToDisplaySize(render)) {
        const canvas = render.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    render.render(scene, camera);

    let lastTime;
    function myRender(time) {
        let deltaTime;
        if (lastTime === undefined) {
            lastTime = 0;
            deltaTime = 0;
        } else {
            deltaTime = time - lastTime;
        }
        lastTime = time;
        if (resizeRendererToDisplaySize(render)) {
            const canvas = render.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        for (const c of itemList) {
            if (!mouseState) {
                c.rotation.x += deltaTime * 0.0003;
                c.rotation.x %= 6.28;
                c.rotation.y += deltaTime * 0.0003;
                c.rotation.y %= 6.28;
            }
        }

        render.render(scene, camera);

        requestAnimationFrame(myRender);
    }
    requestAnimationFrame(myRender);

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

main();