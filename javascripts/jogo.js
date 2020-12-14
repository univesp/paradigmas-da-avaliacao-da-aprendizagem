$(document).ready(function(){

  var modoJogoEscolhido = sessionStorage.getItem('modoJogo');
  console.log(modoJogoEscolhido);

  // Determina a quantidade de cartas do jogo conforme modo de jogo
  if(modoJogoEscolhido == 'rapido'){
    var qtdCartas = 20;
    $('.painel-placeholder .completo').hide();
  } else {
    var qtdCartas = 40;
  }
  // var qtdCartas = 5;
  var pontuacaoMaxima = qtdCartas * 5;

  // Determina a quantidade de itens por categoria
  var cartasPorCategoria = qtdCartas / 5;
  $('.qtd-cartas-total').html(cartasPorCategoria);

  // Printa pontuação inicial
  var pontos = 0  ;
  $( "#pontuacao" ).html(pontos);

  //////////////////////////////////////////////////////////////////////////////////////////////
  // ROTACIONAR CARTÃO
  // $('.itens .carta').click(function() {
  //   $(this).toggleClass('virado');
  // });
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // DRAG N DROP
  function dragnDrop(){
    $( ".itens .carta-item" ).draggable({
      revert: "invalid",
      containment: ".jogo",
      stack: ".carta-item"
    });
    $( ".carta-categoria" ).droppable({
      classes: {
        "ui-droppable-hover": "drag-hover"
      },
      drop: function( event, ui ) {
        $( this ).addClass( "ui-state-highlight" );
        //Opção que foi preenchida
        var categoria = this.getAttribute("data-categoria");
        console.log("categoria = " + categoria);
        //Item que foi enviado
        var item = ui.draggable.attr("data-valor");
        console.log("item = " + item);
        //Compara o item com a categorias
        if(categoria === item){
        // Resposta certa
          console.log("resposta certa");
          $(this).addClass('respondida');
          // Copia a carta para o painel de respostas
          var painelInsert = ".painel[data-painel = '"+ categoria +"'] .painel-respondidas";
          ui.draggable.removeClass('sem-resposta').clone().appendTo(painelInsert);
          // Esconde a carta, mas sem retirá-la do fluxo da página para manter o layout
          ui.draggable.addClass('respondida');
          // Atualiza contador de cartas respondidas
          var respondidosDessaCategoria = ".carta-item.respondida[data-valor = '"+ categoria +"']";
          var qtdRespondidosDessaCategoria = $(respondidosDessaCategoria).length;
          $(this).find(".qtd-cartas-respondidas").html(qtdRespondidosDessaCategoria);
          //Mostra feedback de pontuação
          var feedbackPontuacao = $(this).find('.feedback-pontuacao');
          feedbackPontuacao.addClass('correta animate__animated animate__fadeOutUp animate__delay-1s');
          feedbackPontuacao.one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
            feedbackPontuacao.removeClass('correta animate__animated animate__fadeOutUp animate__delay-1s');
          });
          // Atualiza pontuação
          pontos = pontos + 5;
          $( "#pontuacao" ).html(pontos);
          //chama função de conclusão se todas as cartas foram respondidas
          if ($(".carta-item.respondida").length == qtdCartas){
            endGame();
          }
        } else {
        // Resposta errada
          console.log("resposta errada");
          // Reverte posição
          ui.draggable.animate({
            top: "0",
            left: "0"
          }, 500)
          //Mostra feedback de pontuação
          var feedbackPontuacao = $(this).find('.feedback-pontuacao');
          feedbackPontuacao.addClass('incorreta animate__animated animate__headShake animate__delay-1s');
          feedbackPontuacao.one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
            feedbackPontuacao.removeClass('incorreta animate__animated animate__headShake animate__delay-1s');
          });
          // Atualiza pontuação
          pontos--;
          $( "#pontuacao" ).html(pontos);
        }
      }
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  //TIRA NOVAS CARTAS
  var proximoItem = 1;
  var ultimoItem = qtdCartas;

  $(".carta-banco").click(function(){
    console.log("novas cartas!");
    //Esconde instruções
    $(".instrucoes").hide();
    // Esconde as cartas respondidas. Pega as cartas não respondidas e joga pro final da fila.
    $(".carta-item.respondida").hide();
    $(".carta-item.sem-resposta").each(function(){
      ultimoItem++;
      $(this).attr('data-ordem',ultimoItem).addClass('fechada').removeClass('aberta sem-resposta').css('order', ultimoItem);
    })
    // Conta a quantidade de cartas no monte
    var bancoCartas = $(".carta-item.fechada").length;
    console.log('banco = ' + bancoCartas)
    // Ajusta visibilidade do monte conforme quantidade de cartas
    if(bancoCartas<8){$("#monte-1").hide()};
    if(bancoCartas<7){$("#monte-2").hide()};
    if(bancoCartas<6){
      $("#monte-3").hide();
      $(".carta-banco").hide()
    };
    // Abre as 5 próximas cartas
    console.log("banco = " + bancoCartas);
    var i;
    for (i = 1; i < 6 ; ++i) {
      if (i > bancoCartas) {
        break;
      };
      var proximaCarta = ".carta-item[data-ordem='"+ proximoItem +"']";
      $(proximaCarta).removeClass('fechada').addClass('aberta sem-resposta');
      proximoItem++;
      console.log(proximoItem);
    }
  });
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
    // Insere os elementos do array no html e inicializa Drag n Drop
    $.each(cartasArray, function(index, value){
      // console.log(index);
      // console.log(value.categoria);
      // console.log(value.conteudo);
      // console.log(value.tamanho);
      var cartaOrdem = index + 1;
      // console.log(cartaOrdem);
      var cartaDiv = "<div class='carta carta-item fechada' data-valor='" + value.categoria + "' data-ordem='" + cartaOrdem + "' style='order: " + cartaOrdem + "'><div><div class='" + value.tamanho + "'>" + value.conteudo + "</div></div></div>";
      $("#cartas").append(cartaDiv);
    });
    dragnDrop();
  });
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // VISUALIZA RESPONDIDAS DE CADA CATEGORIA
  $('.carta-categoria').click(function(){
    $('#painel-wrapper').modal('show');
    var categoriaEscolhida = $(this).attr("data-categoria");
    var painelEscolhido = ".painel[data-painel = '"+ categoriaEscolhida +"']";
    $(painelEscolhido).css('display', 'flex');
  });
  $('.fecha-painel').click(function(){
    $('#painel-wrapper').modal('toggle')
  });
  $('#painel-wrapper .modal-content').click(function(){
    $('#painel-wrapper').modal('toggle')
  });
  $('#painel-wrapper').on('hidden.bs.modal', function () {
    $('.painel').css('display', 'none');
  })
  //////////////////////////////////////////////////////////////////////////////////////////////


  //////////////////////////////////////////////////////////////////////////////////////////////
  // FINALIZA O JOGO

  function endGame(){
    // FEEDBACKS
    // Pontuação máxima (200)
    var scorePerfeito =
    '<p><strong>Excelente!</strong></p><p>Você completou o jogo com <strong>100%</strong> de aproveitamento, obtendo a pontuação máxima: <strong>'+ pontos +' pontos</strong>. <br />Você demonstrou conhecer com precisão os paradigmas da avaliação da aprendizagem.</p><p><button type="button" class="btn btn-link" id="imprimir">Clique aqui</button> para acessar e imprimir o painel com os 5 paradigmas que você construiu.</p>';
    // //160-199 Pontos
    var scoreOtimo =
    '<p><strong>Quase lá!</strong></p><p>Parabéns, você completou o jogo com aproveitamento igual ou superior a <strong>80%</strong>, obtendo a pontuação equivalente a <strong>'+ pontos +' pontos</strong> (do máximo de '+ pontuacaoMaxima +' pontos). Você pode afinar um pouco mais seu conhecimento sobre os paradigmas da avaliação da aprendizagem. Quer tentar mais uma vez? Pressione o botão "Jogar novamente".</p><p>Ou <button type="button" class="btn btn-link" id="imprimir">clique aqui</button> para acessar e imprimir o painel com os 5 paradigmas centrais da avaliação da aprendizagem.</p>';
    // //120-160 pontos
    var scoreBom =
    '<p><strong>Muito bem!</strong></p><p>Você completou o jogo com aproveitamento entre <strong>60% e 80%</strong>, obtendo a pontuação equivalente a <strong>'+ pontos +' pontos</strong> (do máximo de '+ pontuacaoMaxima +' pontos). O que acha de revisitar as referências sobre o tema no AVA de seu curso? Quer tentar mais uma vez? (Pressione o botão "Jogar novamente".)</p><p>Ou <button type="button" class="btn btn-link" id="imprimir">clique aqui</button> para acessar e imprimir o painel com os 5 paradigmas centrais da avaliação da aprendizagem.</p>';
    // //Abaixo de 120 pontos
    var scoreRegular =
    '<p>Que tal refazer seu percurso de estudos?! Você completou o jogo, porém, não atingiu <strong>60%</strong> de aproveitamento, obtendo a pontuação equivalente a <strong>'+ pontos +' pontos</strong> (do máximo de '+ pontuacaoMaxima +' pontos). O que acha de revisitar as referências sobre o tema no AVA de seu curso? Quer tentar mais uma vez? (Pressione o botão "Jogar novamente".)</p><p>Ou <button type="button" class="btn btn-link" id="imprimir">clique aqui</button> para acessar e imprimir o painel com os 5 paradigmas centrais da avaliação da aprendizagem.</p>';

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
  }

  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // IMPRIMIR
   $('.feedback').on('click', '#imprimir', function() {
     window.print();
    });

  //JOGAR NOVAMENTE
  $('.btn-replay').click(function(){
    // location.reload();
    // return false;
    window.open("modos.html","_self")
  })

  //REINICIAR
  $('.btn-reiniciar').click(function(){
    location.reload();
    return false;
  })
  //////////////////////////////////////////////////////////////////////////////////////////////

})
