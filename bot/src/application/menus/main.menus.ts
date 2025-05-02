import { Menu } from "@grammyjs/menu";
import { BotContext } from "@/types/botContext";
import { authMenu } from "./auth/auth.menus";
import { withPreventDuplicateLogin } from "../../bot/middleware";
import { cardsMenu } from "./cards/cards.menus";
import { publicationMenu } from "./publications/publications.menus";

export const mainMenu = new Menu<BotContext>("main-menu")
  .text("📝 Register", withPreventDuplicateLogin(async (ctx) => {
    await ctx.conversation.enter("registerConversation");
  }))
  .text("🔐 Login", withPreventDuplicateLogin(async (ctx) => {
    await ctx.conversation.enter("loginConversation");
  }))
  .row()
  .submenu("📢 Publications", "publication-menu")
  .row()
  .submenu("🃏 Cards", "cards-menu")
  .submenu("💸 Offers", "offers-menu")
  .row()
  .submenu("⚙️ Account", "auth-menu");

  mainMenu.register(authMenu);
  mainMenu.register(cardsMenu);
  mainMenu.register(publicationMenu);

export async function showMainMenu(ctx: BotContext) {
  await ctx.reply("📋 Main Menu:", {
    reply_markup: mainMenu,
  });
}
