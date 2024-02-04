import { component$ } from '@builder.io/qwik';
import { LogoDiscord, LogoTwitter } from 'qwik-ionicons';

export default component$(() => {

  return (
    <footer class="relative flex flex-col gap-6 items-center justify-center w-full h-24 z-10 bg-gray-950 py-24">
      <div class="flex mt-2">
        <a href="https://discord.com/invite/nmgtX5z">
          <LogoDiscord width="30" class="fill-indigo-200" />
        </a>
        <a href="https://twitter.com/birdflop">
          <LogoTwitter width="30" class="fill-indigo-200 ml-2" />
        </a>
      </div>
      <span class="text-lg text-gray-300 max-w-6xl text-center ,t">
        Copyright © 2024 Birdflop. All rights reserved. Birdflop is a registered 501(c)(3) nonprofit organization (EIN: 93-2401009).<br/>
        By using this site, you agree to our <a href="/terms" class="text-blue-500">terms of service</a>. Items marked with an asterisk (*) are a reminder that our fair use policy outlined in our terms applies.
      </span>
    </footer>
  );
});