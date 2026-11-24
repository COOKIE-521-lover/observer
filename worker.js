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
                  /* 深邃的宇宙底色 */
                  background: radial-gradient(circle at center, #1b2735 0%, #090a0f 100%);
                  color: white;
                  font-family: sans-serif;
              }
              canvas {
                  display: block;
              }
              /* 鼠标悬浮时的提示框 */
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
              }
          </style>
          <!-- 引入 Three.js 3D 引擎 -->
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
          <div id="tooltip">星球名字</div>
          
          <script type="module">
              import * as THREE from 'three';
              import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

              // 1. 初始化场景、相机、渲染器
              const scene = new THREE.Scene();
              const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
              camera.position.z = 25;

              const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
              renderer.setSize(window.innerWidth, window.innerHeight);
              document.body.appendChild(renderer.domElement);

              // 2. 添加鼠标控制（允许旋转缩放视角）
              const controls = new OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.dampingFactor = 0.05;
              controls.autoRotate = true; // 自动缓慢旋转
              controls.autoRotateSpeed = 0.5;

              // 3. 设置光照
              const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
              scene.add(ambientLight);
              const pointLight = new THREE.PointLight(0xffffff, 200, 0, 2);
              pointLight.position.set(0, 0, 0); // 光源放在中心（太阳位置）
              scene.add(pointLight);

              // 4. 创建中心的“太阳”
              const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
              const sunMaterial = new THREE.MeshPhongMaterial({ 
                  color: 0xffaa00, 
                  emissive: 0xff5500, 
                  emissiveIntensity: 2 
              });
              const sun = new THREE.Mesh(sunGeometry, sunMaterial);
              scene.add(sun);

              // ==========================================
              // 5. 配置你的星球（链接、名字、颜色、大小、位置）
              // 你可以自由增加或修改这里的星球数据
              // ==========================================
              const planetsData = [
                  { name: "我的 B 站", url: "https://bilibili.com", color: 0x00a1d6, size: 0.8, x: 6, y: 3, z: 4 },
                  { name: "我的 GitHub", url: "https://github.com/COOKIE-521-lover", color: 0x333333, size: 0.6, x: -5, y: 5, z: -2 },
                  { name: "个人博客", url: "#", color: 0xff6600, size: 0.5, x: 4, y: -6, z: 6 },
                  { name: "联系我", url: "mailto:test@test.com", color: 0x2ecc71, size: 0.4, x: -7, y: -4, z: -5 },
                  { name: "关于我", url: "#", color: 0x9b59b6, size: 0.7, x: 0, y: 8, z: -6 }
              ];

              const planets = [];
              const raycaster = new THREE.Raycaster();
              const mouse = new THREE.Vector2();
              const tooltip = document.getElementById('tooltip');

              // 生成星球
              planetsData.forEach(data => {
                  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
                  const material = new THREE.MeshPhongMaterial({ color: data.color });
                  const planet = new THREE.Mesh(geometry, material);
                  
                  planet.position.set(data.x, data.y, data.z);
                  planet.userData = { name: data.name, url: data.url }; // 把链接存到星球数据里
                  
                  scene.add(planet);
                  planets.push(planet);
              });

              // 6. 鼠标交互：悬浮与点击
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

              // 点击跳转
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

              // 7. 动画渲染循环
              function animate() {
                  requestAnimationFrame(animate);
                  controls.update(); // 如果开启了 autoRotate，这里会转动
                  renderer.render(scene, camera);
              }

              // 窗口自适应
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
