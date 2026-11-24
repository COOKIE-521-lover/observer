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
                  margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
                  background-color: #000; color: white; font-family: 'Segoe UI', sans-serif;
              }
              #bg-image {
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background-image: url('https://raw.githubusercontent.com/COOKIE-521-lover/observer/main/star.jpg');
                  background-size: cover; background-position: center; z-index: 0;
              }
              canvas { display: block; position: relative; z-index: 1; }
              #tooltip {
                  position: absolute; background: rgba(0, 0, 0, 0.8);
                  color: #fff; padding: 8px 15px; border-radius: 20px;
                  font-size: 15px; font-weight: bold; letter-spacing: 1px;
                  pointer-events: none; opacity: 0; transition: opacity 0.3s, transform 0.3s;
                  border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 0 15px rgba(255,255,255,0.1);
                  z-index: 10; transform: translateY(-10px);
              }
          </style>
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
          <div id="bg-image"></div>
          <div id="tooltip">星球名字</div>
          
          <script type="module">
              import * as THREE from 'three';
              import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

              const scene = new THREE.Scene();
              const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
              camera.position.set(0, 5, 25);

              const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
              renderer.setSize(window.innerWidth, window.innerHeight);
              renderer.toneMapping = THREE.ACESFilmicToneMapping; // 让颜色更真实
              document.body.appendChild(renderer.domElement);

              const controls = new OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.dampingFactor = 0.05;
              controls.autoRotate = true; 
              controls.autoRotateSpeed = 0.3;
              controls.enableZoom = false; // 禁用滚轮缩放，避免页面滚动问题
              controls.minDistance = 10;
              controls.maxDistance = 40;

              // --- 添加宇宙星尘（银河） ---
              const starGeometry = new THREE.BufferGeometry();
              const starCount = 3000;
              const posArray = new Float32Array(starCount * 3);
              for(let i = 0; i < starCount * 3; i++) {
                  posArray[i] = (Math.random() - 0.5) * 100;
              }
              starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
              const starMaterial = new THREE.PointsMaterial({
                  size: 0.15, color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
              });
              const starMesh = new THREE.Points(starGeometry, starMaterial);
              scene.add(starMesh);

              // --- 光照 ---
              const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 环境光
              scene.add(ambientLight);
              const pointLight = new THREE.PointLight(0xffaa00, 300, 100); // 太阳发出的光
              pointLight.position.set(0, 0, 0);
              scene.add(pointLight);

              // --- 生成星球的纹理（用代码生成，防止加载失败） ---
              function createTexture(baseColor, isSun = false) {
                  const canvas = document.createElement('canvas');
                  canvas.width = 512; canvas.height = 512;
                  const ctx = canvas.getContext('2d');
                  // 填充基础色
                  ctx.fillStyle = baseColor;
                  ctx.fillRect(0, 0, 512, 512);
                  
                  // 加上噪点模拟星球表面
                  for (let i = 0; i < 5000; i++) {
                      ctx.fillStyle = \`rgba(0,0,0,\${Math.random() * 0.3})\`;
                      ctx.beginPath();
                      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 5, 0, Math.PI * 2);
                      ctx.fill();
                  }
                  if (isSun) {
                      for (let i = 0; i < 3000; i++) {
                          ctx.fillStyle = \`rgba(255,255,255,\${Math.random() * 0.5})\`;
                          ctx.beginPath();
                          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 8, 0, Math.PI * 2);
                          ctx.fill();
                      }
                  }
                  return new THREE.CanvasTexture(canvas);
              }

              // --- 程序化生成土星纹理 ---
              function createSaturnTexture() {
                  const canvas = document.createElement('canvas');
                  canvas.width = 1024; canvas.height = 512;
                  const ctx = canvas.getContext('2d');
                  // 土星底色（米黄/浅金色）
                  ctx.fillStyle = '#e3d1a9';
                  ctx.fillRect(0, 0, 1024, 512);
                  // 绘制水平条纹（土星的特征）
                  for (let i = 0; i < 50; i++) {
                      const y = Math.random() * 512;
                      const height = Math.random() * 20 + 5;
                      const opacity = Math.random() * 0.3;
                      ctx.fillStyle = \`rgba(180, 150, 100, \${opacity})\`;
                      ctx.fillRect(0, y, 1024, height);
                  }
                  // 随机添加一些暗色风暴斑点
                  for (let i = 0; i < 200; i++) {
                      ctx.fillStyle = \`rgba(100, 70, 40, \${Math.random() * 0.2})\`;
                      ctx.beginPath();
                      ctx.ellipse(Math.random() * 1024, Math.random() * 512, Math.random() * 30, Math.random() * 10, 0, 0, Math.PI * 2);
                      ctx.fill();
                  }
                  return new THREE.CanvasTexture(canvas);
              }

              // --- 程序化生成土星环纹理（带透明通道） ---
              function createRingTexture() {
                  const canvas = document.createElement('canvas');
                  canvas.width = 1024; canvas.height = 128;
                  const ctx = canvas.getContext('2d');
                  // 基础透明
                  ctx.clearRect(0, 0, 1024, 128);
                  // 绘制多圈环带
                  for (let i = 0; i < 1024; i++) {
                      // 用正弦波模拟环的疏密
                      let alpha = Math.abs(Math.sin(i * 0.05)) * 0.5 + 0.1;
                      // 随机空隙
                      if (Math.random() > 0.95) alpha = 0.02;
                      ctx.fillStyle = \`rgba(220, 210, 190, \${alpha})\`;
                      ctx.fillRect(i, 0, 1, 128);
                  }
                  return new THREE.CanvasTexture(canvas);
              }

              // --- 中心的太阳 ---
              const sunGeometry = new THREE.SphereGeometry(2.5, 64, 64);
              const sunMaterial = new THREE.MeshStandardMaterial({ 
                  map: createTexture('#ffaa00', true),
                  emissive: 0xff5500,
                  emissiveIntensity: 1.5,
                  roughness: 0.4
              });
              const sun = new THREE.Mesh(sunGeometry, sunMaterial);
              scene.add(sun);

              // --- 星球数据配置 ---
              const planetsData = [
                  { name: "哔哩哔哩", url: "https://bilibili.com", color: '#00a1d6', size: 0.9, x: 7, y: 3, z: 4 },
                  { name: "GitHub", url: "https://github.com/COOKIE-521-lover", color: '#ffffff', size: 0.7, x: -6, y: 5, z: -2 },
                  { name: "个人博客", url: "#", color: '#ff6600', size: 0.8, x: 5, y: -6, z: 7 },
                  { name: "联系我", url: "mailto:test@test.com", color: '#2ecc71', size: 0.6, x: -8, y: -4, z: -5 },
                  { name: "关于我", url: "#", color: '#9b59b6', size: 1.0, x: 0, y: 9, z: -7 }
              ];

              const planets = [];
              const raycaster = new THREE.Raycaster();
              const mouse = new THREE.Vector2();
              const tooltip = document.getElementById('tooltip');

              // 生成星球与发光环
              planetsData.forEach(data => {
                  const geometry = new THREE.SphereGeometry(data.size, 64, 64);
                  // 使用更高级的材质，有真实的反光和粗糙度
                  const material = new THREE.MeshStandardMaterial({ 
                      map: createTexture(data.color),
                      roughness: 0.6,
                      metalness: 0.2
                  });
                  const planet = new THREE.Mesh(geometry, material);
                  planet.position.set(data.x, data.y, data.z);
                  planet.userData = { name: data.name, url: data.url };
                  
                  // 给星球加一圈极淡的外发光（用稍微大一点的透明球体模拟）
                  const glowGeo = new THREE.SphereGeometry(data.size * 1.2, 32, 32);
                  const glowMat = new THREE.MeshBasicMaterial({
                      color: data.color,
                      transparent: true,
                      opacity: 0.15,
                      side: THREE.BackSide // 只渲染内表面，形成光晕
                  });
                  const glow = new THREE.Mesh(glowGeo, glowMat);
                  planet.add(glow); // 把光晕绑在星球上

                  scene.add(planet);
                  planets.push(planet);
              });

              // --- 创建土星本体 ---
              const saturnGeo = new THREE.SphereGeometry(3, 64, 64);
              const saturnMat = new THREE.MeshStandardMaterial({
                  map: createSaturnTexture(),
                  roughness: 0.8,
                  metalness: 0.1
              });
              const saturn = new THREE.Mesh(saturnGeo, saturnMat);
              // 放在太阳与链接星球之间的空位，并稍微倾斜
              saturn.position.set(-11, 1, 6);
              saturn.rotation.z = 0.3;
              saturn.rotation.x = 0.2;
              scene.add(saturn);

              // --- 创建土星环 ---
              const ringGeo = new THREE.RingGeometry(4, 7, 128);
              // 修正 UV：让环纹理沿半径方向展开，形成同心环带
              const ringPos = ringGeo.attributes.position;
              const ringUv = ringGeo.attributes.uv;
              for (let i = 0; i < ringPos.count; i++) {
                  const rx = ringPos.getX(i);
                  const ry = ringPos.getY(i);
                  const r = Math.sqrt(rx * rx + ry * ry);
                  ringUv.setXY(i, (r - 4) / (7 - 4), 0.5);
              }
              ringUv.needsUpdate = true;
              const ringMat = new THREE.MeshBasicMaterial({
                  map: createRingTexture(),
                  side: THREE.DoubleSide,
                  transparent: true,
                  opacity: 0.8,
                  depthWrite: false // 防止环和星球相互遮挡渲染错误
              });
              const ring = new THREE.Mesh(ringGeo, ringMat);
              // 环面默认在 XY 平面，绕 X 轴转 90° 使其平放在土星赤道面
              ring.rotation.x = Math.PI / 2;
              saturn.add(ring); // 把环绑在土星上，一起自转和倾斜

              // --- 给土星补充一点科幻感灯光 ---
              // 主光：暖色，从右上前方照亮土星
              const dirLight = new THREE.DirectionalLight(0xfff5e6, 2);
              dirLight.position.set(5, 3, 5);
              scene.add(dirLight);
              // 补光：冷色调，来自背面，体现宇宙的幽蓝
              const backLight = new THREE.DirectionalLight(0x4a7dff, 1.5);
              backLight.position.set(-5, -3, -5);
              scene.add(backLight);

              // --- 交互事件 ---
              window.addEventListener('mousemove', (event) => {
                  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                  
                  // 提示框跟随鼠标，并加一点位移
                  tooltip.style.left = event.clientX + 15 + 'px';
                  tooltip.style.top = event.clientY - 30 + 'px';

                  raycaster.setFromCamera(mouse, camera);
                  const intersects = raycaster.intersectObjects(planets);

                  if (intersects.length > 0) {
                      tooltip.style.opacity = 1;
                      tooltip.innerText = intersects[0].object.userData.name;
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
                      const url = intersects[0].object.userData.url;
                      if (url && url !== '#') window.open(url, '_blank');
                  }
              });

              // --- 动画循环 ---
              let time = 0;
              function animate() {
                  requestAnimationFrame(animate);
                  
                  time += 0.01;
                  // 让整个星空缓慢旋转
                  starMesh.rotation.y = time * 0.05;
                  starMesh.rotation.x = time * 0.02;
                  
                  // 太阳自转
                  sun.rotation.y += 0.002;

                  // 土星自转（土星环作为子对象会跟着一起转）
                  saturn.rotation.y += 0.003;
                  
                  // 星球自转
                  planets.forEach((planet, index) => {
                      planet.rotation.y += 0.01;
                      // 让星球像呼吸一样缓慢上下浮动
                      planet.position.y += Math.sin(time * 2 + index) * 0.005;
                  });

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
