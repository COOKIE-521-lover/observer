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

              // --- NASA-Punk 程序化纹理：3D 值噪声 + fBm（无缝、无外部贴图） ---
              function smoothstep(t) { return t * t * (3 - 2 * t); }
              function hash3(x, y, z) {
                  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
                  return n - Math.floor(n);
              }
              function noise3D(x, y, z) {
                  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
                  const xf = x - xi, yf = y - yi, zf = z - zi;
                  const u = smoothstep(xf), v = smoothstep(yf), w = smoothstep(zf);
                  const c000 = hash3(xi, yi, zi),     c100 = hash3(xi + 1, yi, zi);
                  const c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
                  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1);
                  const c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
                  const x00 = c000 + (c100 - c000) * u;
                  const x10 = c010 + (c110 - c010) * u;
                  const x01 = c001 + (c101 - c001) * u;
                  const x11 = c011 + (c111 - c011) * u;
                  const y0 = x00 + (x10 - x00) * v;
                  const y1 = x01 + (x11 - x01) * v;
                  return y0 + (y1 - y0) * w;
              }
              function fbm3(x, y, z, octaves = 5) {
                  let value = 0, amp = 0.5, freq = 1, total = 0;
                  for (let i = 0; i < octaves; i++) {
                      value += amp * noise3D(x * freq, y * freq, z * freq);
                      total += amp;
                      amp *= 0.5; freq *= 2.0;
                  }
                  return value / total;
              }
              function hexToRgb(hex) {
                  const m = hex.replace('#', '');
                  const n = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
                  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
              }
              // --- 在球面上采样 3D 噪声，生成无缝星球表面 ---
              function createTexture(baseColor, isSun = false) {
                  const canvas = document.createElement('canvas');
                  const W = 512, H = 256;
                  canvas.width = W; canvas.height = H;
                  const ctx = canvas.getContext('2d');
                  const img = ctx.createImageData(W, H);
                  const px = img.data;
                  const base = hexToRgb(baseColor);
                  const freq = 2.2;
                  for (let y = 0; y < H; y++) {
                      const phi = (y / (H - 1)) * Math.PI;
                      const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
                      for (let x = 0; x < W; x++) {
                          const theta = (x / (W - 1)) * Math.PI * 2;
                          const nx = sinPhi * Math.cos(theta);
                          const ny = cosPhi;
                          const nz = sinPhi * Math.sin(theta);
                          let n = fbm3(nx * freq, ny * freq, nz * freq, 5);
                          n = Math.max(0, Math.min(1, n));
                          n = (n - 0.5) * 1.6 + 0.5; // 增强对比
                          n = Math.max(0, Math.min(1, n));
                          const t = isSun ? (0.55 + 0.65 * n) : (0.15 + 0.85 * n);
                          const pole = 1.0 - 0.22 * Math.abs(Math.cos(phi)); // 两极略暗
                          const i = (y * W + x) * 4;
                          px[i]     = base.r * t * pole;
                          px[i + 1] = base.g * t * pole;
                          px[i + 2] = base.b * t * pole;
                          px[i + 3] = 255;
                      }
                  }
                  ctx.putImageData(img, 0, 0);
                  const tex = new THREE.CanvasTexture(canvas);
                  tex.colorSpace = THREE.SRGBColorSpace;
                  return tex;
              }
              // --- 大气层：菲涅尔边缘辉光 ---
              function createAtmosphere(size, colorHex) {
                  const geo = new THREE.SphereGeometry(size * 1.18, 64, 64);
                  const glow = new THREE.Color(colorHex).lerp(new THREE.Color(0xffffff), 0.3);
                  const mat = new THREE.ShaderMaterial({
                      vertexShader: 'varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
                      fragmentShader: 'varying vec3 vNormal; uniform vec3 uColor; void main() { float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(uColor, 1.0) * intensity; }',
                      uniforms: { uColor: { value: glow } },
                      blending: THREE.AdditiveBlending,
                      side: THREE.BackSide,
                      transparent: true,
                      depthWrite: false
                  });
                  return new THREE.Mesh(geo, mat);
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
                  
                  // NASA-Punk 大气层（菲涅尔边缘辉光）
                  const atmosphere = createAtmosphere(data.size, data.color);
                  planet.add(atmosphere);

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

              // 土星大气（淡金色菲涅尔辉光）
              const saturnAtmosphere = createAtmosphere(3, '#e3d1a9');
              saturn.add(saturnAtmosphere);

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
