export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function buildWhatsappMessage(
  guestName: string,
  guestSlug: string,
  groomNickname: string,
  brideNickname: string,
  hostUrl: string
): string {
  const link = `${hostUrl}/${guestSlug}`;
  return `Halo Bapak/Ibu/Saudara/i *${guestName}*,

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami, *${groomNickname} & ${brideNickname}*.

Berikut detail undangan digital dan informasi lengkap mengenai acara kami dapat diakses melalui tautan berikut:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.

Terima kasih.`;
}
