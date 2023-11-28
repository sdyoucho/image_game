document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById("selected-wrong-image-canvas");
    var ctx = canvas.getContext("2d");
    var currentVersion;
    var foundCountElement = document.getElementById("found-count");
    var totalCountElement = document.getElementById("total-count");
    var currentFoundCount = 0;
    var totalDifferencesCount = 0;
    var clickedDifference = null; // 클릭한 차이점을 저장하는 변수
    var isUpponButtonVisible = true;

    // Uppon_button을 깜빡이게 만들기 위한 타이머 설정
    setInterval(toggleUpponButton, 1000); // 1초마다 깜빡임

    // Uppon_button을 깜빡이게 만들기 위한 함수
    function toggleUpponButton() {
        var upponButton = document.getElementById("uppon-button");
        if (isUpponButtonVisible) {
            upponButton.style.display = 'none';
        } else {
            upponButton.style.display = 'block';
        }
        isUpponButtonVisible = !isUpponButtonVisible; // 상태를 토글
    }

    // 게임 버전별 데이터 및 이미지 경로
    var gameData = {
        "스타데이즈": {
            imagePath: "stardays/stardays_main_image.png",
            wrongImagePath: "stardays/stardays_main_wrong_image.png",
            differences: [
                {
                    x: 271,
                    y: 189,
                    radius: 5, // 반지름 설정
                    description: "쵸키 머리 삔"
                },
                {
                    x: 475,
                    y: 297,
                    radius: 20, // 반지름 설정
                    description: "반 안경"
                },
                {
                    x: 552,
                    y: 252,
                    radius: 10, // 반지름 설정
                    description: "호코리"
                },
                {
                    x: 451,
                    y: 384,
                    radius: 10, // 반지름 설정
                    description: "올리고당"
                },
                {
                    x: 333,
                    y: 482,
                    radius: 5, // 반지름 설정
                    description: "별사탕별"
                },
                {
                    x: 911,
                    y: 452,
                    radius: 10, // 반지름 설정
                    description: "테리 주머니"
                },
                {
                    x: 745,
                    y: 300,
                    radius: 5, // 반지름 설정
                    description: "나츠키 귀걸이"
                }
            ]
        },
        "러브다이아": {
            imagePath: "luvdia/luvdia_main_image.png",
            wrongImagePath: "luvdia/luvdia_main_wrong_image.png",
            checkImagePath: "luvdia/luvdia_main_check_image.png" // 추가: 확인 이미지 경로
        },
        "안케": {
            imagePath: "anke/anke_main_image.png",
            wrongImagePath: "anke/anke_main_wrong_image.png",
            checkImagePath: "anke/anke_main_check_image.png" // 추가: 확인 이미지 경로
        }
    };
    // 이미지를 그리는 함수
    function drawImageOnCanvas(imageSource) {
    var image = new Image();
    image.src = imageSource;

    image.onload = function () {
        // 이미지를 캔버스에 그립니다.
        selectedWrongImageContext.drawImage(image, 0, 0, selectedWrongImageCanvas.width, selectedWrongImageCanvas.height);
    };
}

// 이미지를 그릴 함수 호출 예시
var imageSource = 'luvdia/luvdia_main_wrong_image.png'; // 이미지 경로 설정
drawImageOnCanvas(imageSource);
    // 게임 버전별 다운로드 가능한 이미지 목록
    var gameImages = {
        "스타데이즈": ["prize/stardays_natsuki.png", "prize/stardays_choki.png", "prize/stardays_van.png", "prize/stardays_terri.png"],
        "러브다이아": ["prize/luvdia_ani.png", "prize/luvdia_hayu.png", "prize/luvdia_dona.png", "prize/luvdia_lili.png", "prize/luvdia_mei.png"],
        "안케": ["prize/anke_image.png"]
    };

    // 위치 표시용
    document.querySelector('.selected-wrong-image-container').addEventListener('click', function (event) {
        var rect = this.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        console.log("Clicked at (x=" + x + ", y=" + y + ")");
    });

    // 찾은 차이점 수 업데이트 함수
    function updateFoundCount() {
        foundCountElement.textContent = currentFoundCount;
        totalCountElement.textContent = totalDifferencesCount;
    }

    // 게임 버전 선택 처리 함수
    function handleGameVersionSelection(version) {
        currentVersion = version;
        startGame(currentVersion);
        showImage(currentVersion); // 게임 버전 선택
    }

    // 게임 버전 선택 이벤트
    document.querySelectorAll('.game-version').forEach(function (button) {
        button.addEventListener('click', function () {
            handleGameVersionSelection(this.dataset.version);
        });
    });

    // 게임 시작 함수
    function startGame(version) {
        var data = gameData[version];
        totalDifferencesCount = data.differences.length; // 변경된 이미지 갯수로 설정
        currentFoundCount = 0;
        updateFoundCount();
        canvas.style.display = 'block';
        loadGame(data.imagePath, data.wrongImagePath);
    }

    // 게임 이미지 로드 및 차이점 초기화 함수
    function loadGame(imagePath, wrongImagePath) {
        var image = new Image();
        image.src = imagePath;

        var wrongImage = new Image();
        wrongImage.src = wrongImagePath;

        // 이미지 로드 후에 비교 작업을 진행
        image.onload = function () {
            ctx.drawImage(image, 0, 0);

            wrongImage.onload = function () {
                var diffCanvas = document.createElement('canvas');
                diffCanvas.width = image.width;
                diffCanvas.height = image.height;
                var diffCtx = diffCanvas.getContext('2d');

                diffCtx.drawImage(wrongImage, 0, 0);
                var img1 = ctx.getImageData(0, 0, image.width, image.height);
                var img2 = diffCtx.getImageData(0, 0, image.width, image.height);

                var diffData = new Uint8Array(img1.data.length);
                var numDiffPixels = pixelmatch(img1.data, img2.data, diffData, image.width, image.height, {
                    threshold: 0.1
                });

                // 차이점 표시
                for (var i = 0; i < gameData[currentVersion].differences.length; i++) {
                    var difference = gameData[currentVersion].differences[i];
                    var centerX = difference.x;
                    var centerY = difference.y;
                    var radius = difference.radius;

                    // 차이점 위치에 원 그리기
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "red"; // 원의 테두리 색상
                    ctx.stroke();

                    // 차이점 설명 추가
                    ctx.fillStyle = "red"; // 텍스트 색상
                    ctx.fillText(difference.description, centerX - 40, centerY + 20);
                }

                if (numDiffPixels > 0) {
                    currentFoundCount++;
                    updateFoundCount();
                    if (currentFoundCount === totalDifferencesCount) {
                        showDownloadSection();
                    }
                }
            };
        };
    }

    // 다운로드 섹션 표시 함수
    function showDownloadSection() {
        var downloadSection = document.getElementById("download-section");
        var imageOptions = document.getElementById("image-options");
        imageOptions.innerHTML = '';
        gameImages[currentVersion].forEach(function (image) {
            var img = document.createElement('img');
            img.src = image;
            img.onclick = function () {
                downloadImage(this.src);
            };
            imageOptions.appendChild(img);
        });

        // 게임 화면을 숨기고 보상 화면을 표시
        canvas.style.display = 'none';
        downloadSection.style.display = "block";
    }

    // 이미지 다운로드 함수
    function downloadImage(imagePath) {
        var link = document.createElement('a');
        link.download = imagePath.split('/').pop();
        link.href = imagePath;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // X 버튼 클릭 이벤트 처리
    var closeButton = document.getElementById("close-button");
    closeButton.addEventListener('click', function () {
        // 다운로드 섹션을 숨깁니다.
        var downloadSection = document.getElementById("download-section");
        downloadSection.style.display = "none";

        // 선택한 이미지를 초기화합니다.
        var selectedImage = document.getElementById("selected-image");
        selectedImage.src = "";
        var selectedWrongImage = document.getElementById("selected-wrong-image");
        selectedWrongImage.src = "";

        // 메인 화면으로 돌아가기 위해 게임을 재시작합니다.
        startGame(currentVersion);
    });

    // 클릭한 차이점을 저장하는 변수 초기화
    function resetClickedDifference() {
        clickedDifference = null;
    }

    // 마우스 오버 및 터치 이벤트 처리 함수
function handleMouseOver(event) {
    var rect = canvas.getBoundingClientRect();
    var x, y;

    if (event.type === "touchstart" || event.type === "touchmove") {
        // 터치 이벤트인 경우, 첫 번째 터치의 좌표를 사용
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }

    // 클릭한 차이점 초기화
    resetClickedDifference();

    // 차이점 확인
    for (var i = 0; i < gameData[currentVersion].differences.length; i++) {
        var difference = gameData[currentVersion].differences[i];
        var centerX = difference.x;
        var centerY = difference.y;
        var radius = difference.radius;

        // 클릭한 좌표와 차이점의 거리 계산
        var distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        // 클릭한 위치가 차이점 범위 내에 있는지 확인
        if (distance <= radius) {
            clickedDifference = difference;

            // 차이점을 표시 (빨간색 원 그리기)
            ctx.beginPath(); // 새로운 도형의 시작
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red"; // 원의 테두리 색상
            ctx.stroke();
            ctx.closePath(); // 도형 닫기

            // 차이점 설명 추가
            ctx.fillStyle = "red"; // 텍스트 색상
            ctx.fillText(difference.description, centerX - 40, centerY + 20);
            break; // 가장 가까운 차이점을 표시하고 종료
        }
    }
}

    // 마우스 오버 및 터치 이벤트 리스너 등록
    canvas.addEventListener('mouseover', handleMouseOver);
    canvas.addEventListener('mousemove', handleMouseOver);
    canvas.addEventListener('touchstart', handleMouseOver);
    canvas.addEventListener('touchmove', handleMouseOver);

    // 차이점 클릭 시 동작하는 함수 (이 부분은 필요에 따라 추가할 수 있습니다)
    function handleDifferenceClick() {
        if (clickedDifference) {
            // 클릭한 차이점에 대한 동작을 여기에 추가
            // 예: clickedDifference.description를 사용하여 차이점에 대한 설명을 표시하거나 다른 작업을 수행할 수 있습니다.
        }
    }

    // 차이점 클릭 이벤트 리스너 등록 (이 부분은 필요에 따라 추가할 수 있습니다)
    canvas.addEventListener('click', handleDifferenceClick);
    canvas.addEventListener('touchend', handleDifferenceClick);
});

