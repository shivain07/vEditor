import { Footer, FooterCopyright, FooterIcon } from "flowbite-react";

import { BsLinkedin, BsGithub, BsInstagram, BsTwitterX } from "react-icons/bs";

export default function FooterComponent() {
  return (
    <Footer container>
      <div className="w-full text-center">
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <FooterCopyright href="#" by="vEdit" year={2025} />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <FooterIcon
              href="https://www.linkedin.com/in/shivain-gusain-bab76020a/"
              icon={BsLinkedin}
            />
            <FooterIcon href="https://x.com/its_shivain" icon={BsTwitterX} />
            <FooterIcon href="https://github.com/shivain07" icon={BsGithub} />
            <FooterIcon
              href="https://www.instagram.com/artbyseven7/"
              icon={BsInstagram}
            />
          </div>
        </div>
      </div>
    </Footer>
  );
}
