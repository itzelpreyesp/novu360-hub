document.addEventListener('DOMContentLoaded', function() {
  const el = document.getElementById('rate-us-btn') 
    || document.querySelector('[data-rate]');
  if (!el) return;
  el.addEventListener('click', function() {
    console.log('Rate us feature invoked');
  });
});
