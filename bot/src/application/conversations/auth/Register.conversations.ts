import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../../../types/botContext";
import { AuthClient } from "../../../client/auth/Auth.client";
import { session } from "../../../bot/Middleware";
import { mainMenu } from "../../../application/menus/Main.menus";

export async function registerConversation(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext
) {
  const authClient = new AuthClient();

  try {
    await ctx.reply("🧑‍💻 ¿Cual es tu nombre?");
    const name = await conversation.form.text();

    await ctx.reply("📧 ¿Cual es tu mail?");
    const email = await conversation.form.text();

    await ctx.reply("🔐 Elije una contraseña:");
    const password = await conversation.form.text();

    const result = await authClient.register({ name, email, password });

    const telegramUserId = ctx.from?.id.toString();
    console.log(ctx.from?.id.toString())
    if (telegramUserId) {
      session.save(telegramUserId, result);
    }

    await ctx.reply("✅ Te has registrado correctamente!");
  } catch (error) {
    console.error("Register error:", error);
    await ctx.reply("❌ Registro fallido. Por favor, intenta nuevamente.");
  }


}
