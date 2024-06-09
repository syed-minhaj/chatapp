export default function resizeTextarea() {
    const textarea = document.querySelector(".txA");
    const top = document.querySelector(".topB");
  
    let initialY = 0;
    let initialHeight = 0;
  
    top.addEventListener("mousedown", function (e) {
      if (e.target === top) {
        initialY = e.clientY;
        initialHeight = textarea.offsetHeight;
        window.addEventListener("mousemove", resizeM);
        window.addEventListener("mouseup", stopResize);
      }
    });
    
    top.addEventListener('touchstart', function(e) {
      if (e.target === top) {
        e.preventDefault();
       initialY = e.touches[0].clientY;
       initialHeight = textarea.offsetHeight;
       window.addEventListener('touchmove', resize);
       window.addEventListener('touchend', stopResize);
      }
     });
  
     function resizeM(e) {
      const newHeight = initialHeight - (e.clientY - initialY);
      if (newHeight > 0) {
        textarea.style.height = `${newHeight}px`;
      }
     }
  
    function resize(e) {
      const newHeight = initialHeight - (e.touches[0].clientY  - initialY);
      if (newHeight > 0) {
        textarea.style.height = `${newHeight}px`;
      }
    }
  
    function stopResize() {
      window.removeEventListener("mousemove", resizeM);
      window.removeEventListener('touchmove', resize);
    }
  }