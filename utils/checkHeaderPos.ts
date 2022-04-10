import lodash from "lodash";

const SWITCH_POS = 350;

const checkHeader = lodash.throttle(() => {
  const scrollPosition = window.scrollY;
  if (scrollPosition > SWITCH_POS) {
    const header = document.querySelector("#sticky-header");
    if (header){
      header.classList.add("sticky-header-visible");
      header.classList.remove("sticky-header-hidden");
    }
    
  }
  // else {
  //   const header = document.querySelector("#sticky-header");
  //   if (header){
  //     header.classList.add("sticky-header-hidden");
  //     header.classList.remove("sticky-header-visible");
  //   }
  // }
}, 300);

export default checkHeader;