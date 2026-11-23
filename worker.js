export default {
  async fetch(request, env, ctx) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>测试连接</title></head>
      <body style="background: white; color: red; font-size: 50px; text-align: center; margin-top: 20vh;">
        <h1>CONNECTED!</h1>
        <p style="font-size: 20px;">如果你看到这行字，说明 Cloudflare 已经成功跑通了代码。</p>
        <p style="font-size: 20px;">当前访问的域名是: ${request.headers.get("host")}</p>
      </body>
      </html>
    `;
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
