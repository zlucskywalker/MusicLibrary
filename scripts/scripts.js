// Ativar o menu mobile
// Certifique-se de incluir o jQuery antes deste script
// <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

function motrarMenu() {
  $("header nav#nav-esq ul#menu-principal").css("display", "flex");
  $("header nav#nav-esq ul#menu-principal").addClass(
    "animate__animated animate__fadeInRight animate__slow"
  );

  $("header nav#nav-esq ul#icone-menu li#menu").css("display", "none");

  $("header nav#nav-esq ul#icone-menu li#menux").css("display", "flex");
}

function esconderMenu() {
  $("header nav#nav-esq ul#menu-principal").css("display", "none");

  $("header nav#nav-esq ul#icone-menu li#menu").css("display", "flex");

  $("header nav#nav-esq ul#icone-menu li#menux").css("display", "none");
}

let controle = true;

$("header nav#nav-esq ul#icone-menu").click(function () {
  if (controle == true) {
    motrarMenu();
    controle = false;
  } else {
    esconderMenu();
    controle = true;
  }
});
