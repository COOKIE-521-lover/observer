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
                  background-color: #000; 
              }
              .bg-image {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  /* 引用你刚上传的 star.jpg */
                  background-image: url('./star.jpg');
                  background-size: cover; 
                  background-position: center; 
                  z-index: -1; 
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
