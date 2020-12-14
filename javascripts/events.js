$(document).ready(function(){

   //////////////////////////////////////////////////////////////////////////////////////////////
   // TELA INICIAL
  $('#btnIniciar').click(function(){
    // $("nav").css('display', 'none');
    // $(".intro").css('display', 'none');
    // $(".opcoes").css('display', 'flex');
    // $('html,body').scrollTop(0);
    window.open("modos.html","_self");
  })


  // SELEÇÃO DE MODOS
  // Muda a página chamada dependendo do tamanho da tela
  function tamanhoTela(tela) {
  if (tela.matches) { // If media query matches
      window.open("jogo.html","_self")
    } else {
      window.open("jogo-m.html","_self")
    }
  }
  var tela = window.matchMedia("(min-width: 768px)");

  $("#modo-20").click(function(){
    sessionStorage.setItem('modoJogo', 'rapido');
    tamanhoTela(tela) // Call listener function at run time
  });
  $("#modo-40").click(function(){
    sessionStorage.setItem('modoJogo', 'completo');
    tamanhoTela(tela) // Call listener function at run time
  });

})
