;(function ( $, window, document, undefined ) {
	
	var pluginName = 'multiSelectionWPag';
	
	function Plugin ( element, options ) {
	        this.element = element;
	        this._name = pluginName;
	        this._defaults = $.fn.multiSelectionWPag.defaults;
	        this.options = $.extend(true, {}, this._defaults, options );
	        this.init();
	 }
	
    $.extend(Plugin.prototype, {
        init: function () {
            this.buildCache();
            this.makeDom();
            this.bindEvents();
        },

        destroy: function() {
            this.unbindEvents();
            this.$element.removeData();
        },

        buildCache: function () {
        	var plugin = this;
        	plugin.$element = $(plugin.element)
            plugin.$element.checkbox_array = Array();
        	plugin.$element.extra_data = plugin.options.extra_data;
        	plugin.$element.allSelected_flag = false;
        	plugin.$element.totalElements = 0;
        	plugin.$element.totalPages = 1;
        	plugin.$element.currentPage = 1;
        	plugin.$element.typing = false;
        	plugin.$element.timer;
        	plugin.$element.search = '';
        	plugin.$element.listHeight = 0;
        },

        bindEvents: function() {
            var plugin = this;
          
            plugin.$element.on('click','.'+plugin._name+'_select input', function(event) {
	            	if(event.handled !== true)
	            	{
	            		event.handled = true;
			            if(plugin.$element.children('.'+plugin._name+'_div').css('display') === 'none')
			            {
			            	plugin.openMenu(plugin);
			            }
	            	}
            });
            
            plugin.$element.on('click','.'+plugin._name+'_select span', function(event) {
            	if(event.handled !== true)
            	{
            		event.handled = true;
		            if(plugin.$element.children('.'+plugin._name+'_div').css('display') === 'none')
		            {
		            	plugin.openMenu(plugin);
		            }
		            else
		            {
		            	plugin.closeMenu(plugin);
		            }
            	}
            });
            
            plugin.$element.on('click',plugin.$element.children('.'+plugin._name+'_div').children('.'+plugin._name+'_pagination'), function(event) {
            	event.stopPropagation();
            });
            
            plugin.$element.on('keypress','.'+plugin._name+'_select input', function(event) {
            	if(plugin.$element.children('.'+plugin._name+'_select').children('input').val().length >= plugin.options.min_search_len)
            	{
                    if (!plugin.$element.typing) 
                    {
                    	plugin.$element.typing = true;
                    }            	    
                }
            });
            
            plugin.$element.on('keyup','.'+plugin._name+'_select input', function(event) {
            	if (plugin.$element.typing) 
                {
                    	clearTimeout(plugin.$element.timer);
                	    plugin.$element.timer = setTimeout(function(){plugin.searchEngine(plugin);},500);
                }
            });
            
            plugin.$element.on('keydown','.'+plugin._name+'_select input', function(event) {;
            	if (event.keyCode === 8 || event.keyCode === 46) 
            	{
	            	if (!plugin.$element.typing) 
	                {
	                     	plugin.$element.typing = true;
	                }       
            	}
            });
            
            plugin.$element.on('change','.'+plugin._name+'_list label input', function(event) {
            	plugin.checkUncheck(plugin,event);
            });
            
            plugin.$element.on('change','.'+plugin._name+'_checkbox_selectall', function(event) {
	            	if($(event.target).is(':checked')) {
	            		plugin.$element.allSelected_flag = true;
	            		plugin.$element.find('.'+plugin._name+'_list label input').prop( "checked", true );
	            		plugin.$element.children('.'+plugin._name+'_select').children(':input').attr('placeholder',plugin.options.allSelection);
	            	}
	            	else
	            	{
	            		plugin.$element.allSelected_flag = false;
	            		plugin.$element.find('.'+plugin._name+'_list label input').prop( "checked", false );
	            		plugin.$element.children('.'+plugin._name+'_select').children(':input').attr('placeholder',plugin.options.noSelection);
	            	}
	            	plugin.$element.checkbox_array.length = 0;
            });
            
            $(document).on('click', function(event){
            	if(event.handled !== true)
            	{
            		event.handled = true;
            		if (!$(event.target).closest('.'+plugin._name).length) 
            		{
            			plugin.closeMenu(plugin);
            		}
               	}
            });
        },

        unbindEvents: function() {
            this.$element.off('.'+this._name);
        },
        
        openMenu: function() {
        	var plugin = this;
        	var button = $('.'+plugin._name+'_select span button');
        	button.removeClass('glyphicon-chevron-up');
        	button.addClass('glyphicon-chevron-down');
        	var button = plugin.$element.children('.'+plugin._name+'_select').find('button');
        	$('.'+plugin._name+'_div').css('display','none');
        	$('.'+plugin._name+'_select input').val('');
        	plugin.$element.search = '';
        	button.removeClass('glyphicon-chevron-down');
        	button.addClass('glyphicon-chevron-up');
    	    plugin.displayList(plugin);
        },
        
        closeMenu: function() {
        	var plugin = this;
        	var button = $('.'+plugin._name+'_select span button');
        	$('.'+plugin._name+'_div').css('display','none');
        	$('.'+plugin._name+'_select input').val('');
        	plugin.$element.search = '';
        	button.removeClass('glyphicon-chevron-up');
        	button.addClass('glyphicon-chevron-down');
        },
        
        searchEngine: function() {
        		var plugin = this;
        		plugin.$element.typing = false;
        	    plugin.$element.search = plugin.$element.children('.'+plugin._name+'_select').children('input').val();
				plugin.$element.children('.'+plugin._name+'_div').children('.'+plugin._name+'_pagination').removeData('twbsPagination');
				plugin.$element.currentPage = 1;
				plugin.makeQuery(plugin);
        },
        
        buildNavigation: function() {
        	 var plugin = this;
        	 var pagination = plugin.$element.children('.'+plugin._name+'_div').children('.'+plugin._name+'_pagination');
        	 pagination.twbsPagination({
						first: plugin.options.first,
						prev:  plugin.options.prev,
						next:  plugin.options.next,
						last:  plugin.options.last,
						pageClass: plugin.options.pageClass,
						activeClass: plugin.options.activeClass,
					    disabledClass: plugin.options.disabledClass,
						visiblePages: plugin.options.visiblePages,
						totalPages: plugin.$element.totalPages,
						onPageClick: function (event, page) {
			            	if(event.handled !== true)
			            	{
			            		event.handled = true;
								plugin.$element.currentPage = page;
								plugin.makeQuery(plugin);
			            	}
						}
				});
        },
        
        displayList: function() {
       	 	var plugin = this;
        	var div_list = plugin.$element.children('.'+plugin._name+'_div');
        	plugin.$element.children('.'+plugin._name+'_div').children('.'+plugin._name+'_pagination').removeData('twbsPagination');
        	plugin.$element.currentPage = 1;
        	plugin.makeQuery(plugin);
        	div_list.toggle();
        	
        },
        
        checkUncheck: function() {
        	var plugin = this;
        	function add_element(event){
				if($.inArray($(event.target).val(), plugin.$element.checkbox_array) == -1){
					plugin.$element.checkbox_array.push($(event.target).val());
				}
        	}
        	
        	function drop_element(event){
				var checkbox_index = $.inArray($(event.target).val(), plugin.$element.checkbox_array);
				if(checkbox_index != -1){
					plugin.$element.checkbox_array.splice(checkbox_index, 1);
				}
        	}
        	
        	if(plugin.$element.allSelected_flag === false)
        	{
	        	if($(event.target).is(':checked')) {
	        		add_element(event);
				}
				else 
				{
					drop_element(event);
				}
	        	
	        	if(plugin.$element.checkbox_array.length == plugin.$element.totalElements)
	        	{
	        		plugin.$element.allSelected_flag = true;
	        		$('.'+plugin._name+'_checkbox_selectall').prop( "checked", true );
	        		plugin.$element.checkbox_array.length = 0;
	        	}
        	}
        	else
        	{
	        	if($(event.target).is(':checked')) {
	        		drop_element(event);
				}
				else 
				{
	        		add_element(event);
				}
	        	
	        	if(plugin.$element.checkbox_array.length == plugin.$element.totalElements)
	        	{    
	        		plugin.$element.allSelected_flag = false;
	        		$('.'+plugin._name+'_checkbox_selectall').prop( "checked", false );
	        		plugin.$element.checkbox_array.length = 0;
	        	}
        	}
        	
        	var mensaje_input = plugin.options.noSelection;
        	
        	if (plugin.$element.checkbox_array.length == 1) {
        		if(plugin.$element.allSelected_flag)
        		{
        			mensaje_input = (plugin.$element.totalElements -plugin.$element.checkbox_array.length) +' '+plugin.options.multiSelection;
        		}
        		else
        		{
        			mensaje_input = plugin.options.oneSelection;
        		}
        	}
        	else if (plugin.$element.checkbox_array.length > 1)
        	{
        		if(plugin.$element.allSelected_flag)
        		{
        			mensaje_input = (plugin.$element.totalElements -plugin.$element.checkbox_array.length) +' '+plugin.options.multiSelection;
        		}
        		else
        		{
        			mensaje_input = plugin.$element.checkbox_array.length +' '+plugin.options.multiSelection;
        		}
        	}
        	
        	plugin.$element.children('.'+plugin._name+'_select').children(':input').attr('placeholder',mensaje_input);
        },
        
        makeQuery: function() {
        	var plugin = this;
			var list = plugin.$element.children('.'+plugin._name+'_div').children('.'+plugin._name+'_list');
			if(plugin.$element.listHeight != 0) {list.css("min-height",plugin.$element.listHeight);}
			list.html('');
        	function checked (plugin,list,data)
        	{
        		$(list).append('<label for="'+plugin.$element.context.id+'_checkbox_'+data.value+'"><input type="checkbox" id="'+plugin.$element.context.id+'_checkbox_'+data.value+'" class="'+plugin.options.checkboxClass+'" value="'+data.value+'" checked/><span class="'+plugin.options.spanClass+'">'+data.label+'</span></label>');
        	}
        	
        	function nochecked(plugin,list,data)
        	{
        		$(list).append('<label for="'+plugin.$element.context.id+'_checkbox_'+data.value+'"><input type="checkbox" id="'+plugin.$element.context.id+'_checkbox_'+data.value+'" class="'+plugin.options.checkboxClass+'" value="'+data.value+'" /><span class="'+plugin.options.spanClass+'">'+data.label+'</span></label>');
        	}
        	
        	$.ajax({
				type: 'POST',
				dataType: 'JSON',
				url: plugin.options.data_url,
				data: { current_page: plugin.$element.currentPage, elements_page: plugin.options.elements_page, extra_data: plugin.$element.extra_data, search: plugin.$element.search},
				success: function(data){
					if(plugin.$element.totalElements === 0)
					{
						plugin.$element.totalElements = parseInt(data['rows'].count);
				    }
					
					plugin.$element.totalPages = Math.round(parseInt(data['rows'].count) / parseInt(plugin.options.elements_page));
					
					if(plugin.$element.totalPages == 0)
					{
						plugin.$element.totalPages = 1;
					}

					if(plugin.$element.children('.'+plugin._name+'_div').children('.'+plugin._name+'_pagination').data('twbsPagination') === undefined)
					{
						plugin.buildNavigation();
					}
				
					if(data['list'].length == 0)
					{
						  $(list).append('<span class="'+plugin._name+'_noresults">'+plugin.options.noResults+'</span>');
					}
					else
					{
						for(var ind in data['list'])
						{
							  data['list'][ind].value = data['list'][ind].value.toString();
						      var checkbox_index = $.inArray(data['list'][ind].value, plugin.$element.checkbox_array);
					          if(plugin.$element.allSelected_flag === false)
					          {					      
									if(checkbox_index != -1){
										checked(plugin,list,data['list'][ind]);
									}
									else
									{
										nochecked(plugin,list,data['list'][ind]);
									}
					          }
					          else
					          {
								   if(checkbox_index != -1){
									  nochecked(plugin,list,data['list'][ind]);
								   }
								   else
								   {
									  checked(plugin,list,data['list'][ind]);
								   }
					          }
						}
					}
					
					if(plugin.$element.listHeight == 0)
					{
						plugin.$element.listHeight = list.height();
					}
				}
			 });
        },
        
        makeDom: function() {
        	var plugin = this;
        	plugin.$element.addClass(plugin._name);
        	plugin.$element.html('<div class="'+plugin._name+'_select input-group"><input class="'+plugin.options.inputClass+' form-control" style="margin-top: 2px;" type="text" placeholder="'+plugin.options.noSelection+'"><span class="input-group-btn"><button class="btn btn-primary glyphicon glyphicon-chevron-down" type="button"></button></span></div><div class="'+plugin._name+'_div"><div class="'+plugin._name+'_list"></div><ul class="'+plugin._name+'_pagination '+plugin.options.navClass+'"></ul></br><label class="'+plugin.options.selectAllClass+'" for="'+plugin.$element.context.id+'_checkbox_selectall"><span><input class="'+plugin._name+'_checkbox_selectall" id="'+plugin.$element.context.id+'_checkbox_selectall" type="checkbox" />'+plugin.options.selectAllName+'</span></label>');   	
        },
    });
    
    $.fn.multiSelectionWPag = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
        return this;
    };
    
    $.fn.multiSelectionWPag.defaults = {
	 		first: 'First',
			prev: 'Previous',
			next: 'Next',
			last: 'Last',
	        pageClass: 'page',
	        activeClass: 'active',
	        disabledClass: 'disabled',
			noResults: 'No results are found...',
			noSelection: 'Click for select options...',
			oneSelection: '1 option is selected',
			multiSelection: 'options selected',
			allSelection: 'All options selected',
			inputClass: 'form-control input-sm', 
			navClass: 'pagination-sm',
			spanClass: 'span_checkbox',
			selectAllClass: 'btn btn-default span_selectall',
			selectAllName: 'Select All',
			checkboxClass: '',
			visiblePages: 1,
			data_url: '',
			elements_page: 10,
			min_search_len: 1,
			extra_data: {},
    };
})( jQuery, window, document );
