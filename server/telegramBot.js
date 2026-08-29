/* global process */
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

const parseIdList = (value = '') => (
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
);

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const formatOrderMessage = (order = {}) => {
    const items = (order.items || []).map((item, index) => {
        const amount = ['kg', 'gr'].includes(item.unit)
            ? `${item.amount_grams || 0} gr`
            : `${item.quantity || 1} ta`;

        return `${index + 1}. ${escapeHtml(item.product_name || 'Mahsulot')} - ${amount}`;
    }).join('\n');

    const telegramLine = order.customer_telegram
        ? `\nTelegram: ${escapeHtml(order.customer_telegram)}`
        : '';

    const noteLine = order.message
        ? `\n\nSavol/xabar:\n${escapeHtml(order.message)}`
        : '';

    return [
        '<b>🛍 Yangi buyurtma!</b>',
        `<b>Buyurtma ID:</b> #${order.id || ''}`,
        '',
        `<b>Mijoz:</b> ${escapeHtml(order.customer_name || 'Noma\'lum')}`,
        `<b>Telefon:</b> ${escapeHtml(order.customer_phone || 'Kiritilmagan')}${telegramLine}`,
        '',
        '<b>Mahsulotlar:</b>',
        items || 'Mahsulotlar ko\'rsatilmadi',
        noteLine
    ].filter(Boolean).join('\n');
};

export const createTelegramBot = ({ token, ownerIds = [], envAdminIds = [], AdminModel, getNextId }) => {
    if (!token) {
        console.warn('Telegram bot token is not configured. Order notifications will be skipped.');
        return {
            notifyOrder: async () => ({ sent: 0, skipped: true }),
            start: () => {}
        };
    }

    const apiUrl = `${TELEGRAM_API_BASE}${token}`;
    let offset = 0;
    let polling = false;

    const request = async (method, body) => {
        const response = await fetch(`${apiUrl}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Telegram ${method} failed: ${text}`);
        }

        return response.json();
    };

    const sendMessage = async (chatId, text, extra = {}) => request('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...extra
    });

    const getAllAdminIds = async () => {
        const dbAdmins = await AdminModel.find();
        return Array.from(new Set([
            ...ownerIds,
            ...envAdminIds,
            ...dbAdmins.map((admin) => admin.chat_id)
        ].filter(Boolean).map(String)));
    };

    const getAllOwnerIds = async () => {
        const dbOwners = await AdminModel.find({ is_owner: true });
        return Array.from(new Set([
            ...ownerIds,
            ...dbOwners.map((admin) => admin.chat_id)
        ].filter(Boolean).map(String)));
    };

    const hasOwner = async () => (await getAllOwnerIds()).length > 0;
    const isOwner = async (chatId) => (await getAllOwnerIds()).includes(String(chatId));
    const isAdmin = async (chatId) => (await getAllAdminIds()).includes(String(chatId));

    const ensureAdmin = async (chatId, name = '', addedBy = 'env', isOwnerFlag = false) => {
        const existing = await AdminModel.findOne({ chat_id: String(chatId) });
        if (existing) {
            if (isOwnerFlag && !existing.is_owner) {
                existing.is_owner = true;
                await existing.save();
            }
            return existing;
        }

        const id = await getNextId(AdminModel);
        const admin = new AdminModel({
            id,
            chat_id: String(chatId),
            name,
            added_by: String(addedBy),
            is_owner: Boolean(isOwnerFlag)
        });
        await admin.save();
        return admin;
    };

    const handleCommand = async (message) => {
        const chatId = String(message.chat.id);
        const text = message.text || '';
        const [command, ...args] = text.trim().split(/\s+/);

        if (command === '/start') {
            if (!(await hasOwner())) {
                const name = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ');
                await ensureAdmin(chatId, name || message.from?.username || 'Bot owner', 'first_start', true);
                await sendMessage(chatId, [
                    '<b>999 Premium Tools bot</b>',
                    'Siz bot egasi qilib tayinlandingiz.',
                    `Sizning chat ID: <code>${chatId}</code>`,
                    '',
                    "Endi /admin orqali panelni ochib, /addadmin CHAT_ID Ism bilan admin qo'sha olasiz."
                ].join('\n'));
                return;
            }

            await sendMessage(chatId, [
                '<b>999 Premium Tools bot</b>',
                `Sizning chat ID: <code>${chatId}</code>`,
                '',
                "Admin bo'lish uchun bot yaratuvchisi shu ID ni qo'shishi kerak."
            ].join('\n'));
            return;
        }
        
        if (!(await isAdmin(chatId))) {
            await sendMessage(chatId, 'Bu bot faqat adminlar uchun. Chat ID ni bot yaratuvchisiga yuboring.');
            return;
        }

        if (command === '/admin' || command === '/help') {
            await sendMessage(chatId, [
                '<b>Admin panel</b>',
                "/admins - adminlar ro'yxati",
                "/addadmin CHAT_ID Ism - yangi admin qo'shish",
                '/removeadmin CHAT_ID - adminni olib tashlash',
                '',
                "Eslatma: admin qo'shish/o'chirish faqat bot yaratuvchisiga ruxsat."
            ].join('\n'));
            return;
        }

        if (command === '/admins') {
            const dbAdmins = await AdminModel.find().sort({ is_owner: -1, created_at: 1 });
            const envLines = [
                ...ownerIds.map((id) => `- <code>${escapeHtml(id)}</code> owner (.env)`),
                ...envAdminIds.map((id) => `- <code>${escapeHtml(id)}</code> admin (.env)`)
            ];
            const dbLines = dbAdmins.map((admin) => (
                `- <code>${escapeHtml(admin.chat_id)}</code> ${admin.is_owner ? 'owner' : 'admin'}${admin.name ? ` - ${escapeHtml(admin.name)}` : ''}`
            ));
            const lines = [...envLines, ...dbLines];
            await sendMessage(chatId, `<b>Adminlar:</b>\n${lines.length > 0 ? lines.join('\n') : 'Hali admin yoq'}`);
            return;
        }

        if (command === '/addadmin') {
            if (!(await isOwner(chatId))) {
                await sendMessage(chatId, "Admin qo'shish faqat bot yaratuvchisiga ruxsat.");
                return;
            }

            const newAdminId = args[0];
            const name = args.slice(1).join(' ');
            if (!newAdminId) {
                await sendMessage(chatId, 'Format: /addadmin CHAT_ID Ism');
                return;
            }

            await ensureAdmin(newAdminId, name, chatId);
            await sendMessage(chatId, `Admin qo'shildi: <code>${escapeHtml(newAdminId)}</code>`);
            await sendMessage(newAdminId, "Siz 999 Premium Tools buyurtma botiga admin qilib qo'shildingiz.");
            return;
        }

        if (command === '/removeadmin') {
            if (!(await isOwner(chatId))) {
                await sendMessage(chatId, "Admin o'chirish faqat bot yaratuvchisiga ruxsat.");
                return;
            }

            const adminId = args[0];
            if (!adminId) {
                await sendMessage(chatId, 'Format: /removeadmin CHAT_ID');
                return;
            }

            await AdminModel.deleteOne({ chat_id: String(adminId) });
            await sendMessage(chatId, `Admin olib tashlandi: <code>${escapeHtml(adminId)}</code>`);
            return;
        }

        await sendMessage(chatId, "Noma'lum buyruq. /admin ni bosing.");
    };

    const poll = async () => {
        if (polling) return;
        polling = true;

        try {
            await request('deleteWebhook', { drop_pending_updates: false });
            console.log('Telegram bot polling started');
        } catch (error) {
            console.error('Telegram deleteWebhook error:', error.message);
        }

        while (polling) {
            try {
                const response = await request('getUpdates', {
                    offset,
                    timeout: 25,
                    allowed_updates: ['message']
                });

                for (const update of response.result || []) {
                    offset = update.update_id + 1;
                    if (update.message?.text) {
                        await handleCommand(update.message);
                    }
                }
            } catch (error) {
                console.error('Telegram polling error:', error.message);
                if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
                    console.error('Telegram bot token is invalid or expired. Stopping polling loop.');
                    polling = false;
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    };

    return {
        notifyOrder: async (order) => {
            const adminIds = await getAllAdminIds();
            const text = formatOrderMessage(order);
            let sent = 0;

            for (const chatId of adminIds) {
                try {
                    await sendMessage(chatId, text);
                    sent += 1;
                } catch (error) {
                    console.error(`Failed to notify Telegram admin ${chatId}:`, error.message);
                }
            }

            return { sent, skipped: adminIds.length === 0 };
        },
        start: () => {
            poll();
        }
    };
};

export const getTelegramConfig = () => ({
    token: process.env.TELEGRAM_BOT_TOKEN,
    ownerIds: parseIdList(process.env.TELEGRAM_BOT_OWNER_IDS),
    envAdminIds: parseIdList(process.env.TELEGRAM_ADMIN_CHAT_IDS)
});
