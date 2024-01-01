const emailStyles =
  "<style>.ltr{text-align:left;}.rtl{text-align:right;}.editor-text-bold{font-weight:bold;}.editor-text-italic{font-style:italic;}.editor-text-underline{text-decoration:underline;}.editor-text-strikethrough{text-decoration:line-through;}.editor-text-underlineStrikethrough{text-decoration:underlineline-through;}.editor-text-code{background-color:#ccc;padding:1px0.25rem;font-family:Menlo,Consolas,Monaco,monospace;font-size:94%;}.editor-link{color:rgb(33,111,219);text-decoration:none;}.editor-code{background-color:#ccc;font-family:Menlo,Consolas,Monaco,monospace;display:block;padding:8px 8px 8px 52px;line-height:1.53;font-size:13px;margin:0;margin-top:8px;margin-bottom:8px;tab-size:2;overflow-x:auto;position:relative;}.editor-code:before{content:attr(data-gutter);position:absolute;background-color:#ddd;left:0;top:0;border-right:1px solid #ccc;padding:8px;color:#777;white-space:pre-wrap;text-align:right;min-width:25px;}.editor-code:after{content:attr(data-highlight-language);top:0;right:3px;padding:3px;font-size:10px;text-transform:uppercase;position:absolute;color: #000;}.editor-tokenComment{color:slategray;}.editor-tokenPunctuation{color:#999;}.editor-tokenProperty{color:#905;}.editor-tokenSelector{color:#690;}.editor-tokenOperator{color:#9a6e3a;}.editor-tokenAttr{color:#07a;}.editor-tokenVariable{color:#e90;}.editor-tokenFunction{color:#dd4a68;}.editor-paragraph{margin:0;margin-bottom:8px;position:relative;}.editor-paragraph:last-child{margin-bottom:0;}.editor-heading-h1{font-size:24px;margin:0;margin-bottom:12px;padding:0;}.editor-heading-h2{font-size:16px;margin:0;margin-top:10px;padding:0;}.editor-quote{margin:0;margin-left:20px;font-size:15px;color:rgb(101,103,107);border-left-color:rgb(206,208,212);border-left-width:4px;border-left-style:solid;padding-left:16px;}.editor-list-ol{padding:0;margin:0;margin-left:16px;list-style-type:decimal;}.editor-list-ul{list-style-type:circle;padding:0;margin:0;margin-left:16px;}.editor-listitem{margin:8px 32px 8px 32px;}.editor-nested-listitem{list-style-type:none;}</style>";

const emailVerificationTemplate = (username, token) => {
  const serverLink = `${process.env.SERVER_URL}:${process.env.PORT}`;
  const confirmLink = `${serverLink}/confirm/${token}`;
  const declineLink = `${serverLink}/decline/${token}`;

  return `
    <html>
    <head>
      <style>
          .container {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              line-height: 1.5;
              font-size: 15px;
              background-color: #edf2f7;
              margin: 0 auto 0 auto;
              padding: 2.5rem 7rem 2.5rem 7rem;
          }
          .verify-btn {
              background-color: #175e7a;
              color: white !important;
              padding: 0.75rem 1.5rem 0.75rem 1.5rem;
              text-decoration: none;
              border-radius: 0.375rem;
          }
          .verify-btn:hover {
              background-color: #1d7699;
          }
          .link {
              background-color: #eaeff1;
              color: #4c51bf;
              text-decoration: underline;
              padding: 0.5rem 0.75rem 0.5rem 0.75rem;
              border-radius: 0.375rem;
              font-size: small;
          }
          .cancel-link {
              color: #f03535 !important;
              font-weight: 700;
              text-decoration: none;
          }
          .cancel-link:hover {
              text-decoration: underline;
          }
          .space-y>*+* {
              margin-top: 0.375rem;
          }
          @media (max-width: 720px) {
            .container {
              padding: 0.25rem 1.5rem 0.25rem 1.5rem;
              font-size: 12px;
            }
            .logo {
              height: 32px;
            }
            .link {
              font-size: 10px;
            }
          }
      </style>
    </head>
    <body>
    <div class="container">
      <div style="color: #4a5568; background-color: #edf2f7; margin: 1.75rem 0 1.75rem 0;">
          <div style="background-color: white; padding-bottom: 1.5rem;">
              <div style="text-align: center; padding: 1.0rem 0 0.5rem 0;">
                  <img src="cid:logo" alt="logo" class="logo"/>
              </div>
              <hr style="border: 0.5px solid #ddd; margin-top: 0.25rem;" />
              <div class="space-y" style="padding: 0.75rem 2.5rem 0.75rem 2.5rem;">
                  <div>Hey, ${username}!</div>
                  <div>Thanks for choosing drawDB. We are delighted to have you here.</div>
                  <div>Please verify your email by clicking the button below.</div>
                  <div style="padding: 1.75rem 0 1.75rem 0; text-align: center;">
                      <a href="${confirmLink}" class="verify-btn">Click to verify</a>
                  </div>
                  <div>If you're having trouble with the verify button, please copy and paste the URL below into your web browser.</div>
                  <div class="link">
                      <a href="${confirmLink}">${confirmLink}</a>
                  </div>
                  <div>If you didn't create an account with us, please
                      <a href="${declineLink}" class="cancel-link">click here</a> to cancel the account.
                  </div>
                  <div style="padding-top: 1.75rem;"></div>
                  <div>Thank you,</div>
                  <div>The drawDB Team.</div>
              </div>
          </div>
          <div style="text-align: center; margin-top: 1.25rem;">
              <a href="https://discord.com/" style="text-decoration: none; margin-right: 0.4rem;">
                  <img src="cid:discord" alt="discord logo" width="46"/>
              </a>
              <a href="https://twitter.com/" style="text-decoration: none;">
                  <img src="cid:twitter" alt="twitter logo" width="46"/>
              </a>
          </div>
          <div style="text-align: center; font-size: small; margin-top: 0.5rem;">
              &copy; 2024 <strong>drawDB</strong> - All right reserved.
          </div>
      </div>
      </div>
    </body>
  </html>
  `;
};

module.exports = { emailStyles, emailVerificationTemplate };
