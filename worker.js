export default {
  async fetch(request, env, ctx) {
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nemu</title>
          <style>
              body, html {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  /* 删除了 background-color: #000; 让图片不受遮挡 */
              }
              .bg-image {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  /* 修正后的 raw 链接 */
                  background-image: url('https://raw.githubusercontent.com/COOKIE-521-lover/observer/main/star.jpg');
                  background-size: cover; 
                  background-position: center; 
                  /* 删除了 z-index: -1，让它正常显示 */
              }
          </style>
      </head>
      <body>
          <div class="bg-image"></div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
