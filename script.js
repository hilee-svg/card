// DOM 요소들
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const header = document.getElementById('header');

// 폼 필드들
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

// 에러 메시지 요소들
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const messageError = document.getElementById('message-error');

// 유효성 검사 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[가-힣a-zA-Z\s]{2,}$/;

// 유효성 검사 함수들
function validateName(name) {
    if (!name.trim()) {
        return '성함을 입력해주세요.';
    }
    if (!nameRegex.test(name.trim())) {
        return '올바른 성함을 입력해주세요.';
    }
    return '';
}

function validateEmail(email) {
    if (!email.trim()) {
        return '이메일을 입력해주세요.';
    }
    if (!emailRegex.test(email.trim())) {
        return '올바른 이메일 형식을 입력해주세요.';
    }
    return '';
}

function validateMessage(message) {
    if (!message.trim()) {
        return '문의 내용을 입력해주세요.';
    }
    if (message.trim().length < 10) {
        return '문의 내용을 10자 이상 입력해주세요.';
    }
    return '';
}

// 에러 메시지 표시 함수
function showError(inputElement, errorElement, message) {
    inputElement.style.borderColor = 'var(--error-color)';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error-color)';
}

// 에러 메시지 제거 함수
function clearError(inputElement, errorElement) {
    inputElement.style.borderColor = 'var(--border-color)';
    errorElement.textContent = '';
}

// 실시간 유효성 검사
function setupRealTimeValidation() {
    // 이름 필드 실시간 검사
    nameInput.addEventListener('blur', function() {
        const error = validateName(this.value);
        if (error) {
            showError(this, nameError, error);
        } else {
            clearError(this, nameError);
        }
    });

    // 이메일 필드 실시간 검사
    emailInput.addEventListener('blur', function() {
        const error = validateEmail(this.value);
        if (error) {
            showError(this, emailError, error);
        } else {
            clearError(this, emailError);
        }
    });

    // 메시지 필드 실시간 검사
    messageInput.addEventListener('blur', function() {
        const error = validateMessage(this.value);
        if (error) {
            showError(this, messageError, error);
        } else {
            clearError(this, messageError);
        }
    });

    // 입력 시 에러 메시지 제거
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'var(--error-color)') {
                clearError(this, this.id === 'name' ? nameError : 
                          this.id === 'email' ? emailError : messageError);
            }
        });
    });
}

// 폼 제출 처리
function handleFormSubmit(event) {
    event.preventDefault();
    
    // 모든 에러 메시지 초기화
    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(messageInput, messageError);
    
    // 유효성 검사
    const nameErrorMsg = validateName(nameInput.value);
    const emailErrorMsg = validateEmail(emailInput.value);
    const messageErrorMsg = validateMessage(messageInput.value);
    
    let hasErrors = false;
    
    if (nameErrorMsg) {
        showError(nameInput, nameError, nameErrorMsg);
        hasErrors = true;
    }
    
    if (emailErrorMsg) {
        showError(emailInput, emailError, emailErrorMsg);
        hasErrors = true;
    }
    
    if (messageErrorMsg) {
        showError(messageInput, messageError, messageErrorMsg);
        hasErrors = true;
    }
    
    if (hasErrors) {
        // 첫 번째 에러 필드로 스크롤
        const firstErrorField = document.querySelector('.form-input[style*="border-color: var(--error-color)"]');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
        return;
    }
    
    // 폼 제출 처리
    submitForm();
}

// 구글 앱스 스크립트 웹 앱 URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyT4iBFzeRzabeVNk0rswWt5dfIDjR0NF4OWNApxB1ABC1ducZ4w6Ps9SYqW5TNLxLZ/exec';

// 폼 제출 함수 (구글 앱스 스크립트 연동)
async function submitForm() {
    // 로딩 상태 표시
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // 방법 1: iframe을 사용한 폼 제출 (가장 안정적)
        await submitFormWithIframe();
        
    } catch (error) {
        console.error('iframe 방식 제출 실패:', error);
        
        // 방법 2: FormData 사용으로 재시도
        try {
            await submitFormWithFetch();
        } catch (fetchError) {
            console.error('fetch 방식 제출도 실패:', fetchError);
            showErrorMessage('문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    } finally {
        // 로딩 상태 해제
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// 방법 1: iframe을 사용한 폼 제출 (가장 안정적)
function submitFormWithIframe() {
    return new Promise((resolve, reject) => {
        // 숨겨진 폼의 값 설정
        document.getElementById('hiddenName').value = nameInput.value.trim();
        document.getElementById('hiddenEmail').value = emailInput.value.trim();
        document.getElementById('hiddenInquiry').value = messageInput.value.trim();
        
        // iframe 로드 완료 이벤트 리스너
        const iframe = document.getElementById('hiddenIframe');
        
        const handleLoad = () => {
            // 성공으로 간주 (구글 앱스 스크립트가 정상 처리됨)
            showSuccessMessage();
            iframe.removeEventListener('load', handleLoad);
            resolve();
        };
        
        const handleError = () => {
            iframe.removeEventListener('error', handleError);
            reject(new Error('iframe 제출 실패'));
        };
        
        iframe.addEventListener('load', handleLoad);
        iframe.addEventListener('error', handleError);
        
        // 폼 제출
        document.getElementById('hiddenForm').submit();
        
        // 타임아웃 설정 (10초)
        setTimeout(() => {
            iframe.removeEventListener('load', handleLoad);
            iframe.removeEventListener('error', handleError);
            showSuccessMessage(); // 타임아웃이어도 성공으로 간주
            resolve();
        }, 10000);
    });
}

// 방법 2: fetch를 사용한 폼 제출
async function submitFormWithFetch() {
    // FormData 사용 (CORS 문제 해결)
    const formData = new FormData();
    formData.append('name', nameInput.value.trim());
    formData.append('email', emailInput.value.trim());
    formData.append('inquiry', messageInput.value.trim());
    
    // 구글 앱스 스크립트로 데이터 전송
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS 문제 해결을 위해 no-cors 사용
        body: formData
    });
    
    // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
    showSuccessMessage();
}


// 성공 메시지 표시
function showSuccessMessage() {
    contactForm.style.display = 'none';
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // 폼 초기화
    contactForm.reset();
    
    // 로컬 스토리지에서 저장된 데이터 삭제
    localStorage.removeItem('contactFormData');
    
    // 5초 후 폼 다시 표시
    setTimeout(() => {
        contactForm.style.display = 'block';
        successMessage.style.display = 'none';
    }, 5000);
}

// 에러 메시지 표시
function showErrorMessage(message) {
    // 기존 에러 메시지 제거
    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(messageInput, messageError);
    
    // 일반적인 에러 메시지 표시
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.marginTop = 'var(--spacing-md)';
    errorDiv.style.padding = 'var(--spacing-md)';
    errorDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    errorDiv.style.borderRadius = 'var(--radius-md)';
    errorDiv.style.border = '1px solid var(--error-color)';
    errorDiv.textContent = message;
    
    // 폼 뒤에 에러 메시지 삽입
    contactForm.parentNode.insertBefore(errorDiv, contactForm.nextSibling);
    
    // 5초 후 에러 메시지 제거
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// 스크롤 애니메이션
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들 관찰
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// 헤더 스크롤 효과
function setupHeaderScrollEffect() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// 부드러운 스크롤
function setupSmoothScroll() {
    // 모든 내부 링크에 부드러운 스크롤 적용
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 모바일 메뉴 토글 (필요시)
function setupMobileMenu() {
    // 현재는 단순한 구조이므로 필요시 확장
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
}

// 키보드 접근성 개선
function setupKeyboardAccessibility() {
    // Tab 키로 포커스 이동 시 시각적 표시
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    // 마우스 사용 시 키보드 네비게이션 클래스 제거
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// 폼 데이터 로컬 저장 (임시 저장)
function setupFormAutoSave() {
    const formData = JSON.parse(localStorage.getItem('contactFormData') || '{}');
    
    // 저장된 데이터 복원
    if (formData.name) nameInput.value = formData.name;
    if (formData.email) emailInput.value = formData.email;
    if (formData.message) messageInput.value = formData.message;
    
    // 입력 시 데이터 저장
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            const currentData = {
                name: nameInput.value,
                email: emailInput.value,
                message: messageInput.value
            };
            localStorage.setItem('contactFormData', JSON.stringify(currentData));
        });
    });
    
    // 폼 제출 성공 시 저장된 데이터 삭제
    contactForm.addEventListener('submit', () => {
        localStorage.removeItem('contactFormData');
    });
}

// 성능 최적화: 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 이미지 지연 로딩
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 에러 처리
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // 사용자에게 에러 알림 (선택사항)
    if (typeof showNotification === 'function') {
        showNotification('오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
    }
}

// 초기화 함수
function init() {
    try {
        // 폼 이벤트 리스너 설정
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // 실시간 유효성 검사 설정
        setupRealTimeValidation();
        
        // 스크롤 애니메이션 설정
        setupScrollAnimations();
        
        // 헤더 스크롤 효과 설정
        setupHeaderScrollEffect();
        
        // 부드러운 스크롤 설정
        setupSmoothScroll();
        
        // 모바일 메뉴 설정
        setupMobileMenu();
        
        // 키보드 접근성 설정
        setupKeyboardAccessibility();
        
        // 폼 자동 저장 설정
        setupFormAutoSave();
        
        // 지연 로딩 설정
        setupLazyLoading();
        
        // 페이지 로드 완료 알림
        console.log('개인 브랜딩 랜딩 페이지가 성공적으로 로드되었습니다.');
        
    } catch (error) {
        handleError(error, 'init');
    }
}

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 필요한 정리 작업 수행
    console.log('페이지를 떠나고 있습니다.');
});

// 추가 유틸리티 함수들
const utils = {
    // 이메일 유효성 검사
    isValidEmail: (email) => emailRegex.test(email),
    
    // 이름 유효성 검사
    isValidName: (name) => nameRegex.test(name),
    
    // 전화번호 유효성 검사 (필요시)
    isValidPhone: (phone) => /^[0-9-+\s()]{10,}$/.test(phone),
    
    // 문자열 정리
    sanitizeString: (str) => str.trim().replace(/\s+/g, ' '),
    
    // 로컬 스토리지 안전하게 사용
    safeLocalStorage: {
        get: (key) => {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return null;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch {
                return false;
            }
        }
    }
};

// 전역 객체로 유틸리티 노출 (디버깅용)
window.landingPageUtils = utils;

