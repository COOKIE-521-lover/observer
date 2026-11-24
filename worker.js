export default {
  async fetch(request, env, ctx) {
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nemu 的宇宙</title>
          <style>
              body, html {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  background-color: #000;
                  color: white;
                  font-family: sans-serif;
              }

              /* 新增：底层星空背景图 */
              #bg-image {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  background-image: url('https://raw.githubusercontent.com/COOKIE-521-lover/observer/main/star.jpg');
                  background-size: cover;
                  background-position: center;
                  z-index: 0; /* 放在最底层 */
              }

              /* 3D 画布层 */
              canvas {
                  display: block;
                  position: relative;
                  z-index: 1; /* 放在星空之上 */
              }

              /* 悬浮提示框 */
              #tooltip {
                  position: absolute;
                  background: rgba(0, 0, 0, 0.7);
                  color: #fff;
                  padding: 5px 10px;
                  border-radius: 5px;
                  font-size: 14px;
                  pointer-events: none;
                  opacity: 0;
                  transition: opacity 0.2s;
                  border: 1px solid rgba(255,255,255,0.3);
                  z-index: 10;
              }
          </style>
          <!-- 引入 Three.js -->
          <script type="importmap">
            {
              "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
              }
            }
          </script>
      </head>
      <body>
          <!-- 1. 先铺上你的星空图 -->
          <div id="bg-image"></div>
          
          <div id="tooltip">星球名字</div>
          
          <script type="module">
              import * as THREE from 'three';
              import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

              const scene = new THREE.Scene();
              const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
              camera.position.z = 25;

              // 关键：alpha: true 允许 3D 画布透明，露出底部的星空图
              const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
              renderer.setSize(window.innerWidth, window.innerHeight);
              document.body.appendChild(renderer.domElement);

              const controls = new OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.dampingFactor = 0.05;
              controls.autoRotate = true; 
              controls.autoRotateSpeed = 0.5;

              // 添加光照
              const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
              scene.add(ambientLight);
              const pointLight = new THREE.PointLight(0xffffff, 200, 0, 2);
              pointLight.position.set(0, 0, 0); 
              scene.add(pointLight);

              // 中心的太阳
              const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
              const sunMaterial = new THREE.MeshPhongMaterial({ 
                  color: 0xffaa00, 
                  emissive: 0xff5500, 
                  emissiveIntensity: 2 
              });
              const sun = new THREE.Mesh(sunGeometry, sunMaterial);
              scene.add(sun);

              // 星球数据
              const planetsData = [
                  { name: "我的 B 站", url: "https://bilibili.com", color: 0x00a1d6, size: 0.8, x: 6, y: 3, z: 4 },
                  { name: "我的 GitHub", url: "https://github.com/COOKIE-521-lover", color: 0xffffff, size: 0.6, x: -5, y: 5, z: -2 },
                  { name: "个人博客", url: "#", color: 0xff6600, size: 0.5, x: 4, y: -6, z: 6 },
                  { name: "联系我", url: "mailto:test@test.com", color: 0x2ecc71, size: 0.4, x: -7, y: -4, z: -5 },
                  { name: "关于我", url: "#", color: 0x9b59b6, size: 0.7, x: 0, y: 8, z: -6 }
              ];

              const planets = [];
              const raycaster = new THREE.Raycaster();
              const mouse = new THREE.Vector2();
              const tooltip = document.getElementById('tooltip');

              planetsData.forEach(data => {
                  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
                  const material = new THREE.MeshPhongMaterial({ color: data.color });
                  const planet = new THREE.Mesh(geometry, material);
                  planet.position.set(data.x, data.y, data.z);
                  planet.userData = { name: data.name, url: data.url };
                  scene.add(planet);
                  planets.push(planet);
              });

              window.addEventListener('mousemove', (event) => {
                  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                  tooltip.style.left = event.clientX + 15 + 'px';
                  tooltip.style.top = event.clientY + 15 + 'px';

                  raycaster.setFromCamera(mouse, camera);
                  const intersects = raycaster.intersectObjects(planets);

                  if (intersects.length > 0) {
                      const hoveredPlanet = intersects[0].object;
                      tooltip.style.opacity = 1;
                      tooltip.innerText = hoveredPlanet.userData.name;
                      document.body.style.cursor = 'pointer';
                  } else {
                      tooltip.style.opacity = 0;
                      document.body.style.cursor = 'default';
                  }
              });

              window.addEventListener('click', () => {
                  raycaster.setFromCamera(mouse, camera);
                  const intersects = raycaster.intersectObjects(planets);
                  if (intersects.length > 0) {
                      const clickedPlanet = intersects[0].object;
                      if (clickedPlanet.userData.url !== '#') {
                          window.open(clickedPlanet.userData.url, '_blank');
                      }
                  }
              });

              function animate() {
                  requestAnimationFrame(animate);
                  controls.update();
                  renderer.render(scene, camera);
              }

              window.addEventListener('resize', () => {
                  camera.aspect = window.innerWidth / window.innerHeight;
                  camera.updateProjectionMatrix();
                  renderer.setSize(window.innerWidth, window.innerHeight);
              });

              animate();
          </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
