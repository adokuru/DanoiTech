$(function(){
    $(window).scroll(function() {
        if ($(this).scrollTop() > 165){  
         //$('.scroll-top-sec').show();
         $('.property-menu-bar').addClass("headerstuck");
          }
          else{
            $('.property-menu-bar').removeClass("headerstuck");
          }
     });
     
    $('#frm_search_result_page_search').on('submit', function(){
        var thisForm = $(this);
        var typeItems = [];
        $.each($("input[name='chk_filter_property_type[]']:checked"), function() {
            typeItems.push($(this).val());
        });
        var pageNumber            = $(".hid_search_page").val();
        var sortBy = $('.sort_items_by').val();
        var filters = {};
        
        thisForm.find($('.search_item')).each(function(){
            var thisItem = $(this);
            if(thisItem.val()){
                var name = thisItem.attr('name');
                filters[name] = thisItem.val();
            }
        });
        filters['propTypeIn'] = typeItems;
        var params = {filters:filters, sortBy: sortBy, type: $('.hid_search_type').val(), page: pageNumber};
        $.ajax({
            url: thisForm.attr('action'),
            type: 'POST',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=utf-8',
            async: true,
            beforeSend: function(){
                $.loading();
            },
            success: function (response, status, xhr){
                $.loaded();
                $('.agent_search_result_container').html(response);
            }
        });
        
        return false;
    });
    
    $(document).on('click', '.min_price_option_group a', function (e) {
        e.stopPropagation();
        $('.txt_filter_min_price').val($(this).data('val'));
        $('.min_price_option_group').css('visibility', 'hidden');
        $('.max_price_option_group').css('visibility', 'visible');
        var min = $('.txt_filter_min_price').val();
        var max = $('.txt_filter_max_price').val();
        $('.btn_filter_by_price .btntext').text(getPriceButtonText(min, max));
        $('.txt_filter_max_price').focus();
    });
    
    $(document).on('click', '.max_price_option_group a', function (e) {
        $('.txt_filter_max_price').val($(this).data('val'));
        var min = $('.txt_filter_min_price').val();
        var max = $('.txt_filter_max_price').val();
        $('.btn_filter_by_price .btntext').text(getPriceButtonText(min, max));
    });
    
    $('.txt_filter_min_price').on('focus', function(){
        $('.min_price_option_group').css('visibility', 'visible');
        $('.max_price_option_group').css('visibility', 'hidden');
    });
    
    $('.txt_filter_max_price').on('focus', function(){
        $('.min_price_option_group').css('visibility', 'hidden');
        $('.max_price_option_group').css('visibility', 'visible');
    });
    
    $('.any-price-menu').on('hide.bs.dropdown', function () {
        var min = $('.txt_filter_min_price').val();
        var max = $('.txt_filter_max_price').val();
        $('.min_price_option_group').css('visibility', 'hidden');
        $('.max_price_option_group').css('visibility', 'hidden');
        $('.btn_filter_by_price .btntext').text(getPriceButtonText(min, max));
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
    });
    
    $('.any-price-menu').on('show.bs.dropdown', function () {
        $('.min_price_option_group').css('visibility', 'visible');
        $('.txt_filter_min_price').focus();
    });
    
    $('.filter_agent_by_rating').on('click', 'a', function(){
        $('.txt_filter_agent_rating').val($(this).data('value'));
        $('.btn_filter_by_rating .btntext').text($(this).data('value')+ ($(this).data('value')?' Star':'Rating'));
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
    });
    
    $('.filter_agent_by_recommendation').on('click', 'a', function(){
        $('.txt_filter_agent_recommendation').val($(this).data('value'));
        $('.btn_filter_by_recommendation .btntext').text($(this).data('value')+ ($(this).data('value')?'+ Recomm':'Recommendation'));
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
    });
    
    $('.filter_agent_by_worked_with').on('click', 'a', function(){
        $('.txt_filter_agent_worked_with').val($(this).data('value'));
        $('.btn_filter_by_worked_with .btntext').text(($(this).data('value')?$(this).text():'Worked With'));
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
    });
    
    
    /****************************Property type*********************************/
    $(document).on('change', '.chk_filter_property_type', function (e) {
        var btnText;
        if($("input[name='chk_filter_property_type[]']:checked").length == 1){
            btnText = $("input[name='chk_filter_property_type[]']:checked").data('text_val');
        }else if($("input[name='chk_filter_property_type[]']:checked").length == 0){
            btnText = 'Property type';
        }else{
            btnText = 'Property type ('+ $("input[name='chk_filter_property_type[]']:checked").length+')';
        }
        
        $('.btn_filter_by_prop_type .btntext').text(btnText.trimToLength(20));
    });
    
    $('.property_type_dropdown').on('hide.bs.dropdown', function () {
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
    });
    
    /**************************************************************************/
    
    $(document).on('change', '.sort_items_by', function(){
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
    });
    
        
    $('.btn_filter_by_more').on('click', function (event) {
        toggleMoreFilter();
    });

    $('body').on('click', function (e) {
        if (!$('.btn_filter_by_more').is(e.target) 
            && $('.btn_filter_by_more').has(e.target).length === 0 
            && $('.open').has(e.target).length === 0 && !$('.select2-search__field').is(e.target)
        ) {
            closeMoreFilter();
        }
    });
    $('.btn_filter_by_more_options').on('click', function () {
        $('.hid_search_page').val('0');
        $('.frm_search_result_page_search').submit();
        closeMoreFilter();
    });

    $('.btn_filter_by_more_options_cancel').on('click', function () {
        closeMoreFilter();
    });
    
    $('.btn_filter_by_more_options_reset').on('click', function(){
       $('.property_more_filters').find('.search_item').each(function(){
           $(this).val('').trigger("change");
       }); 
    });
    
    $(document).on('click', '.find_agent_pagination a', function(e){
        var thisLink    =   $(this);
        $('.hid_search_page').val(thisLink.data('page'));
        $('.frm_search_result_page_search').submit();
        return false;
    });

    function toggleMoreFilter() {
        $('.btn_filter_by_more').parent().toggleClass('open');
        $('body').toggleClass('overflow-hidden');
        $('.property-menu-bar').toggleClass('sticky');
    }
    function closeMoreFilter(){
        $('.btn_filter_by_more').parent().removeClass('open');
        $('body').removeClass('overflow-hidden');
        $('.property-menu-bar').removeClass('sticky');
    }
});
    