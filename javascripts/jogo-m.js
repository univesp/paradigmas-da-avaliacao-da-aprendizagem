$(document).ready(function(){

  // Cria variável para chamadas do carousel
  var slider = $('.slider-container');

  var modoJogoEscolhido = sessionStorage.getItem('modoJogo');
  console.log(modoJogoEscolhido);

  // Determina a quantidade de cartas do jogo conforme modo de jogo e imprime no botão
  if(modoJogoEscolhido == 'rapido'){
    var qtdCartas = 20;
  } else {
    var qtdCartas = 40;
  }
  // var qtdCartas = 10;
  $("#cartas-restantes").html(qtdCartas);
  var pontuacaoMaxima = qtdCartas * 5;

  // Determina a quantidade de itens por categoria
  var cartasPorCategoria = qtdCartas / 5;
  $('.qtd-cartas-total').html(cartasPorCategoria);

  // Printa pontuação inicial
  var pontos = 0  ;
  $( "#pontuacao" ).html(pontos);

  // Liga fullscreen
  function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }
    else {
      cancelFullScreen.call(doc);
    }
  }

  slider.slick({
    // setting-name: setting-value
    arrows: false,
    centerMode: true,
    // centerPadding: '60px',
    variableWidth: true,
    infinite: false
  });


  //////////////////////////////////////////////////////////////////////////////////////////////
  // CLASSIFICAR ITEM

  function abreClassificacao(){
    $(".opcoes").hide();
    $(".classificacao").fadeIn().addClass('aberto');
    // Aciona listener para fechar o menu em caso de mudança de slide
    $('.slider-container').on('beforeChange', function(){
      fechaClassificacao();
    });
  }

  function fechaClassificacao(){
    $(".opcoes").fadeIn();
    $(".classificacao").hide().removeClass('aberto');
    $('.slider-container').off('beforeChange');
  }
  // Inicia classificação
  // $('.classificar').click(function(){
  //   abreClassificacao();
  // });
  $('#cartas').on("click", ".slick-current", function(){
    if($('.classificacao').hasClass("aberto")){
      fechaClassificacao()
    } else {
      abreClassificacao();
    }
  })
  // Fecha classificação
  $('.cancelar').click(function(){
    fechaClassificacao()
  });


  // Classificação
  $('.btn-categoria').click(function(){
    //Opção que foi preenchida
    var categoria = this.getAttribute("data-categoria");
    console.log("categoria: " + categoria);
    //Item que foi enviado
    var itemCarta = $("#cartas").find(".slick-current");
    // var itemCarta = itemSlider.find(".carta-item");
    var item = itemCarta.attr("data-valor");
    console.log("item: " + item);
    // Confere resposta
    if(categoria === item){
    // Resposta certa
      console.log("resposta certa");
      // Encerra classificação
      // setTimeout(fechaClassificacao, 300);
      fechaClassificacao();
      // Copia a carta para o painel de respostas e tira o placeholder, se houver
      var painelInsert = ".painel[data-painel = '"+ categoria +"'] .painel-respondidas";
      itemCarta.clone().appendTo(painelInsert);
      $(painelInsert).find('.placeholder').remove();
      //Marca carta como respondida no banco
      var itemDataId = itemCarta.attr('data-id');
      var estaCartaBanco = "#cartas-banco .carta-item[data-id='"+ itemDataId +"']";
      $(estaCartaBanco).addClass('respondida').removeClass('sem-resposta');
      // Atualiza contador de cartas respondidas
      var respondidosDessaCategoria = "#cartas-banco .carta-item.respondida[data-valor = '"+ categoria +"']";
      var qtdRespondidosDessaCategoria = $(respondidosDessaCategoria).length;
      $(this).find(".qtd-cartas-respondidas").html(qtdRespondidosDessaCategoria);
      // Atualiza a quantidade no painel de respondidas
      var update = "[data-painel = '"+ categoria +"']";
      $(update).find(".qtd-cartas-respondidas").html(qtdRespondidosDessaCategoria);
      //Faz algo quando completar a categoria
      if(qtdRespondidosDessaCategoria == cartasPorCategoria){
        console.log('categoria cheia');
      }
      //Mostra feedback de pontuação
      itemCarta.delay(400).fadeTo(300, 0);
      var feedbackPontuacao = $('.feedback-pontuacao');
      feedbackPontuacao.addClass('correta animate__animated animate__fadeOutUp animate__delay-2s');
      feedbackPontuacao.one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        feedbackPontuacao.removeClass('correta animate__animated animate__fadeOutUp animate__delay-2s')
        // Tira carta do carousel
        var posicao = itemCarta.index();
        console.log("posicao : " + posicao);
        slider.slick('slickRemove', posicao);;
        // Quando o carousel estiver vazio...
        if($(".slider-container .sem-resposta").length < 1){
          // Se todas as cartas estiverem respondidas, encerra o jogo
          if ($("#cartas-banco .carta-item.respondida").length == qtdCartas){
            endGame();
          } else {
            // Senão, chama próximas cartas
            sacaCartas();
          }
        }
      });
      // Atualiza pontuação
      pontos = pontos + 5;
      $( "#pontuacao" ).html(pontos);


    } else {
      console.log("resposta errada");
      //Mostra feedback de pontuação
      var feedbackPontuacao = $('.feedback-pontuacao');
      $(".btn-categoria").css("pointer-events", "none");
      feedbackPontuacao.addClass('incorreta animate__animated animate__headShake');
      feedbackPontuacao.one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        feedbackPontuacao.removeClass('incorreta animate__animated animate__headShake');
        $(".btn-categoria").css("pointer-events", "auto");
      });
      // Atualiza pontuação
      pontos--;
      $( "#pontuacao" ).html(pontos);
    }

  });



  //
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  //TIRA NOVAS CARTAS
  var proximoItem = 1;
  var esteCarousel = 0;
  var ultimoItem = qtdCartas;

  function escondeInstrucoes(){
    $(".jogo").on("click", function(){
      removeInstrucoes()
    });
    $('.slider-container').on('beforeChange', function(){
      removeInstrucoes()
    });
  }
  function removeInstrucoes(){
    $(".instrucoes").fadeOut(function(){$(this).remove;});
    $(".jogo").off("click");
    $('.slider-container').off('beforeChange');
  }

  // Início (primeiras cartas)
  $(".sacar-cartas").click(function(e){
    if ($(this).hasClass("inicio")){
      toggleFullScreen();
      // toggleFullScreen();
      $(".instrucoes-gerais").hide();
      $(".instrucoes").delay(500).fadeIn(500);
      $('.header').css('display', 'flex');
      sacaCartas();
      $(this).removeClass("inicio");
      e.stopPropagation();
      escondeInstrucoes();
    } else {
      trocaCartas();
    }
  });


  function trocaCartas(){
    console.log("troca cartas");
    // Destroi o carousel anterior
    var esteCarouselId = "slider-" + esteCarousel;
    // owl.trigger('destroy.owl.carousel');
    // $(esteCarouselId).addClass('animate__animated animate__fadeOutUp animate__delay-1s');
    devolveCartas(esteCarouselId);
    const element = document.getElementById(esteCarouselId);
    element.classList.add('animate__animated', 'animate__fadeOutUpBig', 'animate__faster');
    element.addEventListener('animationend', () => {
      console.log('cabou a animacao');
      element.remove();
    });
    sacaCartas();
  };

  function devolveCartas(elemento){
    console.log('devolve cartas');
    var elementoId = $('#' + elemento);
    // Verifica as cartas não respondidas e joga para o final da fila no banco de cartas
    elementoId.find(".carta-item.sem-resposta").each(function(){
      ultimoItem++;
      console.log("ultimo item = " + ultimoItem)
      var dataId =  $(this).attr('data-id');
      var estaCartaBanco = "#cartas-banco .carta-item[data-id='"+ dataId +"']";
      console.log(estaCartaBanco);
      $(estaCartaBanco).attr('data-ordem',ultimoItem).removeClass('aberta').addClass('fechada');
    })
  }

  function sacaCartas(elemento){
    console.log("saca cartas");
    // Conta a quantidade de cartas no monte
    // var bancoCartas = $("#cartas-banco .carta-item.sem-resposta").length;
    // console.log("banco = " + bancoCartas);
    //Cria o container do Carousel
    esteCarousel++;
    var esteCarouselId = "#slider-" + esteCarousel;
    var sliderContainer = "<div class='slider-container' id='slider-" + esteCarousel + "'></div>";
    $(sliderContainer).appendTo("#cartas");
    // Conta a quantidade de cartas no monte
    var bancoCartas = $("#cartas-banco .carta-item.fechada").length;
    // Insere as 5 próximas cartas no carousel
    var i;
    for (i = 1; i < 6 ; ++i) {
      if (i > bancoCartas) {
        break;
      };
      var proximaCarta = "#cartas-banco .carta-item[data-ordem='"+ proximoItem +"']";
      $(proximaCarta).removeClass('fechada').addClass('aberta').clone().appendTo( esteCarouselId );
      proximoItem++;
    }
    // Atualiza a quantidade de cartas no monte e atualiza valor no botão
    bancoCartas = $("#cartas-banco .carta-item.fechada").length;
    $("#cartas-restantes").html(bancoCartas);
    // Quando não tiver mais banco, apagar botão
    if(bancoCartas<1){
      $('.sacar-cartas').addClass('inativo');
    }
    // Constroi o carousel
    $(esteCarouselId).slick({
      arrows: false,
      centerMode: true,
      variableWidth: true,
      infinite: false
    });
    //Anima entrada do elemento
    $(esteCarouselId).addClass("animate__animated animate__fadeInUpBig")
    //Atualiza variável do Carousel
    slider = $(esteCarouselId);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // EMBARALHA ARRAY
  // Função p/ embaralhar array
  function shuffle(arra1) {
    var ctr = arra1.length, temp, index;
  // While there are elements in the array
      while (ctr > 0) {
  // Pick a random index
          index = Math.floor(Math.random() * ctr);
  // Decrease ctr by 1
          ctr--;
  // And swap the last element with it
          temp = arra1[ctr];
          arra1[ctr] = arra1[index];
          arra1[index] = temp;
      }
      return arra1;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  //ALIMENTA O HTML A PARTIR DO JSON COM ORDEM RANDOMIZADA

  // Cria um array com os itens a partir do json
  $.getJSON( "javascripts/cartas-conteudo.json", function( data ) {
  // $.getJSON( "javascripts/cartas-teste.json", function( data ) {
    console.log(data);
    var cartasArray = [];
    var cartaCategoria;
    var cartaConteudo;
    var cartaTamanho;

    $.each( data, function( iCat, cat ) {
      cartaCategoria = cat.categoria;
      // Embaralha os itens de cada categoria
      shuffle(cat.items);
      // Itera conforme a quantidade de itens por categoria
      for (var i = 0; i < cartasPorCategoria; i++) {
        cartaConteudo = cat.items[i].conteudo;
        // Marca os itens com texto muito grande
        if(cartaConteudo.length>170){
          cartaTamanho = 'textao';
        }else{
          cartaTamanho = 'texto';
        };
        // Joga dados de cada item no array
        cartasArray.push({
          categoria: cartaCategoria,
          conteudo: cartaConteudo,
          tamanho: cartaTamanho
        });
      }
    });

    // Embaralha todas as cartas
    shuffle(cartasArray)
    console.log(cartasArray);
    // Insere os elementos do array no html e inicializa Drag n Drop
    $.each(cartasArray, function(index, value){
      // console.log(index);
      // console.log(value.categoria);
      // console.log(value.conteudo);
      // console.log(value.tamanho);
      var cartaOrdem = index + 1;
      // console.log(cartaOrdem);
      var cartaDiv = "<div class='carta carta-item fechada sem-resposta' data-valor='" + value.categoria + "' data-ordem='" + cartaOrdem + "' data-id='carta" + cartaOrdem + "'><div class='" + value.tamanho + "'>" + value.conteudo + "</div></div>";
      $("#cartas-banco").append(cartaDiv);
    });
  });
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // VISUALIZA RESPONDIDAS DE CADA CATEGORIA
  $('.ver-respondidas').click(function(){
    $('#painel-wrapper').fadeIn();
    $(".painel-container").slick({
      arrows: false,
    })
  });

  $('.fecha-aviso').on("click", function(){
    $('.painel-wrapper').off("click");
    $('.aviso-painel').remove();
  })

  $('.fecha-btn').click(function(){
    $('.painel-wrapper').fadeOut();
    $(".painel-container").slick('unslick')
  })

  $('.menu-btn').click(function(){
    $('.menu-painel').addClass('aberto');
  })
  $('.painel-categoria').click(function(){
    $('.menu-painel').addClass('aberto');
  })
  $('.menu-painel').click(function(){
    $('.menu-painel').removeClass('aberto');
  })
  // $('.menu-painel').on('swipe', function(){
  //   $('.menu-painel').removeClass('aberto');
  //   console.log('swipe!')
  // });
  $('.cat-btn').click(function(){
    var index = $(this).index() - 1;
    console.log(index);
    $('.painel-container').slick('slickGoTo', index);
  })


  //////////////////////////////////////////////////////////////////////////////////////////////


  //////////////////////////////////////////////////////////////////////////////////////////////
  // FINALIZA O JOGO

  function endGame(){
    // FEEDBACKS
    // Pontuação máxima (200)
    var scorePerfeito =
    '<p><strong>Excelente!</strong></p><p>Você completou o jogo com <strong>100%</strong> de aproveitamento, obtendo a pontuação máxima: <strong>'+ pontos +' pontos</strong>. <br />Você demonstrou conhecer com precisão os paradigmas da avaliação da aprendizagem.</p><p><a href="http://apps.univesp.br/paradigmas-da-avaliacao-da-aprendizagem/assets/painel-paradigmas.pdf" download class="feedlink">Clique aqui</a> para salvar um painel com os 5 paradigmas da avaliação da aprendizagem.</p>';
    // //160-199 Pontos
    var scoreOtimo =
    '<p><strong>Quase lá!</strong></p><p>Parabéns, você completou o jogo com aproveitamento igual ou superior a <strong>80%</strong>, obtendo a pontuação equivalente a <strong>'+ pontos +' pontos</strong> (do máximo de '+ pontuacaoMaxima +' pontos). Você pode afinar um pouco mais seu conhecimento sobre os paradigmas da avaliação da aprendizagem. Quer tentar mais uma vez? Pressione o botão "Jogar novamente".</p><p>Ou <a href="http://apps.univesp.br/paradigmas-da-avaliacao-da-aprendizagem/assets/painel-paradigmas.pdf" download class="feedlink">clique aqui</a> para salvar um painel com os 5 paradigmas centrais da avaliação da aprendizagem.</p>';
    // //120-160 pontos
    var scoreBom =
    '<p><strong>Muito bem!</strong></p><p>Você completou o jogo com aproveitamento entre <strong>60% e 80%</strong>, obtendo a pontuação equivalente a <strong>'+ pontos +' pontos</strong> (do máximo de '+ pontuacaoMaxima +' pontos). O que acha de revisitar as referências sobre o tema no AVA de seu curso? Quer tentar mais uma vez? (Pressione o botão "Jogar novamente".)</p><p>Ou <a href="http://apps.univesp.br/paradigmas-da-avaliacao-da-aprendizagem/assets/painel-paradigmas.pdf" download class="feedlink">clique aqui</a> para salvar o painel com os 5 paradigmas centrais da avaliação da aprendizagem.</p>';
    // //Abaixo de 120 pontos
    var scoreRegular =
    '<p>Que tal refazer seu percurso de estudos?! Você completou o jogo, porém, não atingiu <strong>60%</strong> de aproveitamento, obtendo a pontuação equivalente a <strong>'+ pontos +' pontos</strong> (do máximo de '+ pontuacaoMaxima +' pontos). O que acha de revisitar as referências sobre o tema no AVA de seu curso? Quer tentar mais uma vez? (Pressione o botão "Jogar novamente".)</p><p>Ou <a href="http://apps.univesp.br/paradigmas-da-avaliacao-da-aprendizagem/assets/painel-paradigmas.pdf" download class="feedlink">clique aqui</a> para salvar um painel com os 5 paradigmas centrais da avaliação da aprendizagem.</p>';

    $( "#score-final" ).html(pontos);
    if(pontos < pontuacaoMaxima * 0.6){
      console.log('regular');
      $( "#feedbackConteudo" ).html(scoreRegular);
    } else if(pontos < pontuacaoMaxima * 0.8){
      console.log('bom');
      $( "#feedbackConteudo" ).html(scoreBom);
    } else if(pontos < pontuacaoMaxima){
      console.log('otimo');
      $( "#feedbackConteudo" ).html(scoreOtimo);
    } else {
      console.log('perfeito');
      $( "#feedbackConteudo" ).html(scorePerfeito);
    }
    $(".jogo").hide();
    $(".feedback").css('display', 'flex');
    $("footer").show();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  //JOGAR NOVAMENTE
  $('.btn-replay').click(function(){
    window.open("modos.html","_self")
  })

  //REINICIAR
  $('.btn-reiniciar').click(function(){
    location.reload();
    return false;
  })
  //////////////////////////////////////////////////////////////////////////////////////////////

})
