const { Telegraf, Scenes, session, Markup } = require('telegraf');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, remove } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://ustyurttanisiw-default-rtdb.firebaseio.com"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const bot = new Telegraf('8610376144:AAGU1xG-mSmAb6-30qgiyWHzUY3RUFt5O6M');
const CHANNEL_LINK = 'https://t.me/ustyurt_tanisiw';

const ADMIN_ID = 7470599966; 

const searchSession = {}; 

// 1. ANKETA SAHNASI (WIZARD)
const registerWizard = new Scenes.WizardScene(
  'REGISTER_SCENE',
  
  (ctx) => {
    ctx.reply(
      "✨ <b>Xosh keldińiz, ájayıp insan!</b> 💫\n\n" +
      "📢 <i>Usı kanalǵa aǵza bolıwdı umıtpań:</i> <b>@ustyurt_tanisiw</b>\n\n" +
      "Búgin táǵdir sizge jańa baxt, yaki kewilli sóhbetles alıp keler... Keliń, birge kóremiz 😉\n\n" +
      "<i>Atıńız kim? (Yamasa ózińizge unaytuǵın sirli laqaptı jazıń)</i> ✍️", 
      { 
        parse_mode: 'HTML',
        ...Markup.removeKeyboard() 
      }
    );
    ctx.wizard.state.userData = {}; 
    return ctx.wizard.next();
  },
  
  (ctx) => {
    ctx.wizard.state.userData.name = ctx.message.text;
    ctx.reply("<b>Jasıńız neshede?</b> 🎂\n<i>(Tek san kirgiziń, mısalı: 20)</i>", { parse_mode: 'HTML' });
    return ctx.wizard.next();
  },
  
  (ctx) => {
    const age = parseInt(ctx.message.text);
    if (isNaN(age)) {
      ctx.reply("❗️ <i>Iltimas, jasıńızdı tek sanlarda kirgiziń (máselen: 20).</i>", { parse_mode: 'HTML' });
      return;
    }
    if (age < 16) {
      ctx.reply("🚫 <b>Keshirersiz, bottan paydalanıw ushın jasıńız keminde 16 da bolıwı kerek.</b>", { parse_mode: 'HTML' });
      return ctx.scene.leave();
    }
    
    ctx.wizard.state.userData.age = age;
    ctx.reply("👤 <b>Jınısıńızdı tańlań:</b>", {
      parse_mode: 'HTML',
      ...Markup.keyboard([['Jigit 👨', 'Qız 👩']]).oneTime().resize()
    });
    return ctx.wizard.next();
  },
  
  (ctx) => {
    ctx.wizard.state.userData.gender = ctx.message.text;
    ctx.reply("🎯 <b>Kimlerdi izlep atırsız?</b>", {
      parse_mode: 'HTML',
      ...Markup.keyboard([
        ['Jigitlerdi 👨', 'Qızlardı 👩'],
        ['Parqı joq 👫']
      ]).oneTime().resize()
    });
    return ctx.wizard.next();
  },

  (ctx) => {
    ctx.wizard.state.userData.lookingFor = ctx.message.text;
    ctx.reply("📍 <b>Qaysı rayonnansız?</b>\n<i>Tómendegi dizimnen tańlań:</i> 👇", {
      parse_mode: 'HTML',
      ...Markup.keyboard([
        ['Beruniy rayonı', 'Bozataw rayonı'],
        ['Ellikqala rayonı', 'Kegeyli rayonı'],
        ['Moynaq rayonı', 'Nókis rayonı'],
        ['Qanlıkól rayonı', 'Qaraózek rayonı'],
        ['Qońırat rayonı', 'Shımbay rayonı'],
        ['Shomanay rayonı', 'Taqıyatas rayonı'],
        ['Taxtakópir rayonı', 'Tórtkúl rayonı'],
        ['Xojeli rayonı', 'Ámiwdárya rayonı']
      ]).resize()
    });
    return ctx.wizard.next();
  },

  (ctx) => {
    const validDistricts = ['Beruniy rayonı', 'Bozataw rayonı', 'Ellikqala rayonı', 'Kegeyli rayonı', 'Moynaq rayonı', 'Nókis rayonı', 'Qanlıkól rayonı', 'Qaraózek rayonı', 'Qońırat rayonı', 'Shımbay rayonı', 'Shomanay rayonı', 'Taqıyatas rayonı', 'Taxtakópir rayonı', 'Tórtkúl rayonı', 'Xojeli rayonı', 'Ámiwdárya rayonı'];
    
    if (!validDistricts.includes(ctx.message.text)) {
      ctx.reply("⚠️ <i>Iltimas, rayondı qolda jazbań. Tómendegi arnawlı túymelerden paydalanıp tańlań.</i>", { parse_mode: 'HTML' });
      return;
    }

    ctx.wizard.state.userData.district = ctx.message.text;
    ctx.reply("💖 <b>Ózińiz haqqında qısqasha, júrekten shıqqan jılı sózlerden jazıń</b>\n\n<i>Mısalı: Taqıyatas rayonınanman, kewildi súhbetlerdi hám sammitlerde sayr etiwdi unataman ✨</i>\n\nEger qálemeseńiz, 'Ótkeriw ⏭' túymesin basıń.", {
      parse_mode: 'HTML',
      ...Markup.keyboard(['Ótkeriw ⏭']).oneTime().resize()
    });
    return ctx.wizard.next();
  },

  (ctx) => {
    ctx.wizard.state.userData.bio = ctx.message.text === 'Ótkeriw ⏭' ? '' : ctx.message.text;
    ctx.reply("📸 <b>Kóz alıp bolmas eń sulıw, jarqıraǵan súwretińizdi jiberiń</b> ✨", { 
      parse_mode: 'HTML',
      ...Markup.removeKeyboard() 
    });
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message.photo) {
      ctx.reply("😅 <i>Bul súwretke uqsamaydı, dosım. Iltimas, chiroyli súwret jiberiń!</i>", { parse_mode: 'HTML' });
      return;
    }
    
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const userId = ctx.from.id;
    
    ctx.wizard.state.userData.photoId = photoId;
    ctx.wizard.state.userData.userId = userId;
    ctx.wizard.state.userData.username = ctx.from.username || null;
    
    await set(ref(db, 'users/' + userId), ctx.wizard.state.userData);

    const user = ctx.wizard.state.userData;
    const caption = `💎 <b>ANKETA TAYAR!</b>\n\n• Atı: <b>${user.name}</b>\n• Jası: <code>${user.age} jas</code>\n• Aymaǵı: 📍 <b>${user.district}</b>\n\n💬 <i>“${user.bio}”</i>\n\n🔥 <i>Kóz tiymasin, júdá kórkem kórinip turibsiz!</i>`;
    
    await ctx.reply("🎉 <b>Tabrikleymiz! Anketańız jarqırap turibdi:</b>", { parse_mode: 'HTML' });
    await ctx.replyWithPhoto(photoId, { caption: caption, parse_mode: 'HTML' });
    
    await ctx.reply("📱 <b>Bas menyu. Kimge ǵayupdan ǵashiq bolamız? 😉</b>", {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📢 Bizdiń kanal: @ustyurt_tanisiw', CHANNEL_LINK)]
      ]),
      ...Markup.keyboard([
        ['🚀 Izlewdi baslaw'],
        ['👤 Meniń anketam', '⚙️ Sazlamalar']
      ]).resize()
    });

    return ctx.scene.leave();
  }
);

const stage = new Scenes.Stage([registerWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.scene.leave(); // Agar anketada bo'lsa chiqib ketadi
  const userId = ctx.from.id;
  const snapshot = await get(ref(db, 'users/' + userId));
  
  if (snapshot.exists()) {
    return ctx.reply(
      "✨ <b>Siz allaqachon ro'yxatdan o'tgansiz!</b>\n\n📢 <i>Kanalimizga qo'shiling:</i> <b>@ustyurt_tanisiw</b>\n\nQani, yuraklarni zabt etishni boshlaymizmi? 😉", 
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.url('📢 Kanal: @ustyurt_tanisiw', CHANNEL_LINK)]
        ]),
        ...Markup.keyboard([
          ['🚀 Izlewdi baslaw'],
          ['👤 Meniń anketam', '⚙️ Sazlamalar']
        ]).resize()
      }
    );
  }
  ctx.scene.enter('REGISTER_SCENE');
});

const resetAccount = async (ctx) => {
  await ctx.scene.leave(); // Sahnadan chiqib ketish
  const userId = ctx.from.id;
  await remove(ref(db, 'users/' + userId));
  await remove(ref(db, 'likes/' + userId));
  await remove(ref(db, 'viewLimits/' + userId));
  delete searchSession[userId];
  
  ctx.reply("🗑 <b>Diqqat! Sizning eski anketangiz bazadan butunlay o'chirildi.</b>\n\nYangi anketa yaratish uchun /start buyrug'ini bosing ✨", {
    parse_mode: 'HTML',
    ...Markup.removeKeyboard()
  });
};

bot.command('reset', (ctx) => {
  resetAccount(ctx);
});

// ADMIN PANEL BUYRUG'I
bot.command('admin', async (ctx) => {
  await ctx.scene.leave(); // Agar anketada bo'lsa darhol chiqazib yuboradi
  const userId = ctx.from.id;
  
  if (userId !== ADMIN_ID) {
    return ctx.reply("❌ Bu buyruq faqat bot admini uchun!");
  }

  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) {
    return ctx.reply("📊 Hozircha bazada foydalanuvchilar yo'q.");
  }

  const usersObj = snapshot.val();
  const usersArray = Object.values(usersObj);
  let totalUsers = usersArray.length;

  let message = `📊 <b>ADMIN PANEL: STATISTIKA</b>\n\n`;
  message += `👥 Jami ro'yxatdan o'tganlar: <b>${totalUsers} ta</b>\n\n`;
  message += `<b>Oxirgi ro'yxatdan o'tganlar:</b>\n`;

  const recentUsers = usersArray.slice(-10).reverse();
  recentUsers.forEach((u, index) => {
    const usernameLink = u.username ? `@${u.username}` : `ID: ${u.userId}`;
    message += `${index + 1}. <b>${u.name}</b> (${u.age} jas, ${u.district}) — ${usernameLink}\n`;
  });

  ctx.reply(message, { parse_mode: 'HTML' });
});

bot.hears('⚙️ Sazlamalar', (ctx) => {
  ctx.reply("⚙️ <b>Sazlamalar bólimi:</b>\n\n📢 <i>Kanalimiz:</i> <b>@ustyurt_tanisiw</b>", {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.url('📢 Kanalga o\'tish', CHANNEL_LINK)]
    ]),
    ...Markup.keyboard([
      ['🔄 Anketanı óshirip, qayta baslaw'],
      ['🔙 Bas menyuǵa qaytıw']
    ]).resize()
  });
});

bot.hears('🔄 Anketanı óshirip, qayta baslaw', (ctx) => {
  ctx.reply("⚠️ <b>Haqiqatan ham anketangizni o'chirmoqchimisiz?</b>\n\nBu amal eski anketangizni bazadan butunlay o'chirib yuboradi va sizni qaytadan ro'yxatdan o'tkazadi.", {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✅ Ha, o\'chirish va qayta boshlash', 'confirm_reset')],
      [Markup.button.callback('❌ Bekor qilish', 'cancel_reset')]
    ])
  });
});

bot.action('confirm_reset', async (ctx) => {
  await ctx.answerCbQuery("Anketangiz o'chirildi!");
  await ctx.editMessageReplyMarkup();
  resetAccount(ctx);
});

bot.action('cancel_reset', async (ctx) => {
  await ctx.answerCbQuery("Bekor qilindi ❌");
  await ctx.editMessageReplyMarkup();
  ctx.reply("📱 <b>Bas menyu:</b>", {
    parse_mode: 'HTML',
    ...Markup.keyboard([
      ['🚀 Izlewdi baslaw'],
      ['👤 Meniń anketam', '⚙️ Sazlamalar']
    ]).resize()
  });
});

bot.hears('🔙 Bas menyuǵa qaytıw', (ctx) => {
  ctx.reply("📱 <b>Bas menyu:</b>", {
    parse_mode: 'HTML',
    ...Markup.keyboard([
      ['🚀 Izlewdi baslaw'],
      ['👤 Meniń anketam', '⚙️ Sazlamalar']
    ]).resize()
  });
});

bot.hears('👤 Meniń anketam', async (ctx) => {
  const userId = ctx.from.id;
  const snapshot = await get(ref(db, 'users/' + userId));
  
  if (!snapshot.exists()) {
    return ctx.reply("❌ Siz ele anketa toltirmagansiz. /start ni basıp baslań!");
  }
  
  const user = snapshot.val();
  const caption = `🌟 <b>Meniń anketam:</b>\n\n• Atı: <b>${user.name}</b>\n• Jası: <code>${user.age} jas</code>\n• Aymaǵı: 📍 <b>${user.district}</b>\n\n💬 <i>“${user.bio}”</i>`;
  ctx.replyWithPhoto(user.photoId, { caption: caption, parse_mode: 'HTML' });
});

// 5 TA ANKETA LIMITI VA QIDIRUV
bot.hears('🚀 Izlewdi baslaw', async (ctx) => {
  const userId = ctx.from.id;
  const userSnapshot = await get(ref(db, 'users/' + userId));

  if (!userSnapshot.exists()) {
    return ctx.reply("❌ Oldin óz anketańızdı toltırıwıńız kerek! /start ni basıń.");
  }

  const currentUser = userSnapshot.val();

  const limitSnap = await get(ref(db, 'viewLimits/' + userId));
  let currentLimit = limitSnap.exists() ? limitSnap.val() : 0;

  if (currentLimit >= 5) {
    return ctx.reply("🛑 <b>Siz 5 ta anketani ko'rib chiqdingiz!</b>\n\nYangi anketalarni ko'rishni davom ettirish uchun kanalimizga obuna bo'ling 👇", {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📢 Kanalǵa aǵza bolıw (@ustyurt_tanisiw)', CHANNEL_LINK)],
        [Markup.button.callback('✅ Davom etish', 'reset_limit')]
      ])
    });
  }

  const allUsersSnap = await get(ref(db, 'users'));
  if (!allUsersSnap.exists()) {
    return ctx.reply("😔 <b>Házirshe bazada basqa adamlar joq.</b> ✨", { parse_mode: 'HTML' });
  }

  const allUsersObj = allUsersSnap.val();
  let candidates = Object.values(allUsersObj).filter(u => u.userId !== userId);

  candidates = candidates.filter(target => {
    const myLooking = currentUser.lookingFor; 
    const targetGender = target.gender;       
    const targetLooking = target.lookingFor;  
    const myGender = currentUser.gender;      

    let isMatch = false;

    if (myLooking.includes('Jigitlerdi') && targetGender.includes('Jigit')) {
      isMatch = true;
    } else if (myLooking.includes('Qızlardı') && targetGender.includes('Qız')) {
      isMatch = true;
    } else if (myLooking.includes('Parqı joq')) {
      isMatch = true;
    }

    let reverseMatch = false;
    if (targetLooking.includes('Jigitlerdi') && myGender.includes('Jigit')) {
      reverseMatch = true;
    } else if (targetLooking.includes('Qızlardı') && myGender.includes('Qız')) {
      reverseMatch = true;
    } else if (targetLooking.includes('Parqı joq')) {
      reverseMatch = true;
    }

    return isMatch && reverseMatch;
  });

  if (candidates.length === 0) {
    return ctx.reply("😔 <b>Házirshe sizge más jup tabılmadı.</b> ✨", { parse_mode: 'HTML' });
  }

  candidates.sort((a, b) => {
    return Math.abs(a.age - currentUser.age) - Math.abs(b.age - currentUser.age);
  });

  if (!searchSession[userId]) {
    searchSession[userId] = 0;
  }

  let index = searchSession[userId];
  if (index >= candidates.length) {
    searchSession[userId] = 0;
    index = 0;
  }

  const target = candidates[index];
  searchSession[userId]++;
  
  await set(ref(db, 'viewLimits/' + userId), currentLimit + 1);

  const flirtPhrases = [
    "💘 <i>Bunday sulıwlıqtı kórip, tilińiz baylanıp qalmawı múmkin... 😉</i>",
    "🔥 <i>Kózlerińiz ushırasqan ketti ba? Sezimler alday almaydı... ✨</i>",
    "🌹 <i>Bálkim, taǵdirdiń eń ájayıp sawǵası usı insandır?</i>",
    "💫 <i>Onıń bir jyljayǵanı júregingizni teletiwine jetip asadı... ❤️</i>",
    "⚡️ <i>Házir júreginiz 'tup-tup' urıp ketkenin sezip turman! 🤫</i>"
  ];
  const randomFlirt = flirtPhrases[Math.floor(Math.random() * flirtPhrases.length)];

  const caption = `🎯 <b>SIZGE ATALǴAN JUP:</b>\n\n• Atı: <b>${target.name}</b>\n• Jası: <code>${target.age} jas</code>\n• Aymaǵı: 📍 <b>${target.district}</b>\n\n💬 <i>“${target.bio}”</i>\n\n${randomFlirt}`;

  await ctx.replyWithPhoto(target.photoId, {
    caption: caption,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('❤️ Unadı (Like)', `like_${target.userId}`),
        Markup.button.callback('👎 Ótkeriw', `skip_${target.userId}`)
      ],
      [Markup.button.callback('💤 Qıdırıwdı toqtatıw', 'stop_search')]
    ])
  });
});

bot.action('reset_limit', async (ctx) => {
  const userId = ctx.from.id;
  await set(ref(db, 'viewLimits/' + userId), 0);
  await ctx.answerCbQuery("Rahmat! Davom etamiz ✅");
  await ctx.editMessageText("✅ <b>Tabriklaymiz! Davom etishingiz mumkin:</b>", { parse_mode: 'HTML' });
  ctx.reply("📱 <b>Bas menyu:</b>", {
    parse_mode: 'HTML',
    ...Markup.keyboard([
      ['🚀 Izlewdi baslaw'],
      ['👤 Meniń anketam', '⚙️ Sazlamalar']
    ]).resize()
  });
});

// LIKE VA MATCH TIZIMI
bot.action(/^like_(.+)$/, async (ctx) => {
  const targetId = Number(ctx.match[1]); 
  const userId = ctx.from.id;            
  
  await ctx.answerCbQuery("❤️ Seziminigiz jiberildi! 💌");
  await ctx.editMessageReplyMarkup();
  
  const targetLikesRef = ref(db, 'likes/' + targetId);
  const targetLikesSnap = await get(targetLikesRef);
  let targetLikes = targetLikesSnap.exists() ? targetLikesSnap.val() : [];
  
  if (!targetLikes.includes(userId)) {
    targetLikes.push(userId);
    await set(targetLikesRef, targetLikes);
  }

  const myLikesSnap = await get(ref(db, 'likes/' + userId));
  const myLikes = myLikesSnap.exists() ? myLikesSnap.val() : [];
  const targetLikesMe = myLikes.includes(targetId);

  const senderSnap = await get(ref(db, 'users/' + userId));
  const targetSnap = await get(ref(db, 'users/' + targetId));
  
  const sender = senderSnap.val();
  const target = targetSnap.val();

  if (targetLikesMe) {
    const senderContact = sender.username ? `@${sender.username}` : `tg://user?id=${userId}`;
    const targetContact = target.username ? `@${target.username}` : `tg://user?id=${targetId}`;

    await ctx.reply(`🎉 <b>SEZIMLERÍNIZ ÓZ-ARA KELISTI (MATCH)! 💖🔥</b>\n\nEndi erkin sóylesiwińiz múmkin: ${targetContact}`, { parse_mode: 'HTML' });

    try {
      await bot.telegram.sendMessage(targetId, `🎉 <b>SEZIMLERÍNIZ ÓZ-ARA KELISTI (MATCH)! 💖🔥</b>\n\n${sender.name} menen baylanısqa shıǵıń: ${senderContact}`, { parse_mode: 'HTML' });
    } catch (e) {
      console.log("Xabar yuborib bo'lmadi");
    }

  } else {
    try {
      await bot.telegram.sendMessage(targetId, `🔥 <b>Hey! Sizge kimgedur qattı unapsız... 😉</b>\n\nMine onıń kórkem anketası:`, { parse_mode: 'HTML' });
      await bot.telegram.sendPhoto(targetId, sender.photoId, {
        caption: `• Atı: <b>${sender.name}</b>\n• Jası: <code>${sender.age} jas</code>\n• Aymaǵı: 📍 <b>${sender.district}</b>\n\n💬 <i>“${sender.bio}”</i>`,
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('❤️ Sizge de unadımı?', `like_${userId}`)]
        ])
      });
    } catch (e) {
      console.log("Xabar yuborib bo'lmadi");
    }
  }

  ctx.reply("✨ Ajoyib tańlaw! Keyingi júrekdi tabamız ba? 😉", Markup.keyboard([
    ['🚀 Izlewdi baslaw'],
    ['👤 Meniń anketam', '⚙️ Sazlamalar']
  ]).resize());
});

bot.action(/^skip_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery("Ótkerip jiberildi ⏭");
  await ctx.editMessageReplyMarkup();
  return ctx.reply("Keyingi anketani tabıw ushın tómendegi túymeni basıń:", Markup.keyboard([
    ['🚀 Izlewdi baslaw']
  ]).resize());
});

bot.action('stop_search', async (ctx) => {
  await ctx.answerCbQuery("Qıdırıwdı toqtatıldı 💤");
  await ctx.editMessageReplyMarkup();
  ctx.reply("📱 <b>Bas menyu:</b>", {
    parse_mode: 'HTML',
    ...Markup.keyboard([
      ['🚀 Izlewdi baslaw'],
      ['👤 Meniń anketam', '⚙️ Sazlamalar']
    ]).resize()
  });
});

bot.launch();
console.log('Bot muvaffaqiyatli ishga tushdi...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));